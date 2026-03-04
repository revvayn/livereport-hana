const pool = require("../db");

/* ==================== MASTER DATA CONTROLLERS ==================== */

// Get All Finishing (Ganti getFinishingByItem)
exports.getAllFinishing = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM item_finishing ORDER BY id DESC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil data master finishing" });
    }
};

exports.createFinishing = async (req, res) => {
    const { finishing_code, description, warehouse, item_code } = req.body; // Tambah item_code
    try {
        const result = await pool.query(
            `INSERT INTO item_finishing (finishing_code, description, warehouse) 
             VALUES ($1, $2, $3) RETURNING *`,
            [finishing_code, description, warehouse]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: "Kode Finishing sudah ada" });
        }
        res.status(500).json({ error: "Gagal menambah master finishing" });
    }
};

exports.updateFinishing = async (req, res) => {
    const { id } = req.params;
    const { finishing_code, description, warehouse } = req.body;
    try {
        const result = await pool.query(
            `UPDATE item_finishing 
             SET finishing_code=$1, description=$2, warehouse=$3 
             WHERE id=$4 RETURNING *`,
            [finishing_code, description, warehouse, item_code, id] // Urutan parameter disesuaikan
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal update data finishing" });
    }
};

exports.deleteFinishing = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM item_finishing WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json({ message: "Data finishing dihapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus data finishing" });
    }
};


/* ==================== GENERATE LOGIC (STRICT BY ITEM_CODE RELATION) ==================== */

const calculateFinishingSchedule = (packingSchedule) => {
    if (!packingSchedule || !Array.isArray(packingSchedule)) return [];

    // 1. Hitung TOTAL QTY yang harus di-finishing dari seluruh jadwal packing
    let totalQtyToProcess = 0;
    packingSchedule.forEach(day => {
        for (let s = 1; s <= 3; s++) {
            totalQtyToProcess += (day.shifts?.[`shift${s}`]?.qty || 0);
        }
    });

    if (totalQtyToProcess === 0) return [];

    // 2. Cari tanggal Packing PALING AWAL untuk menentukan titik mulai finishing
    // Kita ingin finishing SELESAI tepat 1 shift sebelum packing pertama dimulai
    const activeDays = packingSchedule
        .filter(d => (d.shifts.shift1.qty + d.shifts.shift2.qty + d.shifts.shift3.qty) > 0)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (activeDays.length === 0) return [];
    
    // Titik mulai mundur: Hari pertama packing dimulai
    const firstPackingDateStr = activeDays[0].date.split('T')[0];
    const [year, month, day] = firstPackingDateStr.split("-").map(Number);
    
    // Cari shift pertama yang ada isinya di hari tersebut
    let firstShift = 1;
    for(let s=1; s<=3; s++) {
        if(activeDays[0].shifts[`shift${s}`].qty > 0) {
            firstShift = s;
            break;
        }
    }

    // Tentukan target Slot Finishing Pertama (Mundur 1 shift dari packing pertama)
    let currentDayObj = new Date(year, month - 1, day);
    let currentShift = firstShift - 1;
    if (currentShift < 1) {
        currentDayObj.setDate(currentDayObj.getDate() - 1);
        currentShift = 3;
    }

    const finishingDataMap = {};
    const capacityPerShift = 100; // Sesuaikan dengan kapasitas shift Anda
    let remainingQty = totalQtyToProcess;

    // 3. Plotting Mundur secara teratur
    while (remainingQty > 0) {
        const y = currentDayObj.getFullYear();
        const m = String(currentDayObj.getMonth() + 1).padStart(2, "0");
        const d = String(currentDayObj.getDate()).padStart(2, "0");
        const dateKey = `${y}-${m}-${d}`;

        if (!finishingDataMap[dateKey]) {
            finishingDataMap[dateKey] = {
                date: dateKey,
                shifts: {
                    shift1: { qty: 0, active: false, type: "finishing" },
                    shift2: { qty: 0, active: false, type: "finishing" },
                    shift3: { qty: 0, active: false, type: "finishing" }
                }
            };
        }

        const take = Math.min(remainingQty, capacityPerShift);
        finishingDataMap[dateKey].shifts[`shift${currentShift}`].qty = take;
        finishingDataMap[dateKey].shifts[`shift${currentShift}`].active = true;
        
        remainingQty -= take;

        // Mundur ke slot sebelumnya
        currentShift--;
        if (currentShift < 1) {
            currentDayObj.setDate(currentDayObj.getDate() - 1);
            currentShift = 3;
        }
    }

    return Object.values(finishingDataMap);
};

exports.generateFinishing = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Ambil Delivery Date dari demand utama
        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [id]);
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        // 2. Ambil data melalui relasi item_routings (perhatikan akhiran 's')
        // Gunakan LEFT JOIN itf agar jika master finishing belum diset, query tidak langsung pecah (meskipun data finishing_code wajib ada di routing)
        const itemsRes = await client.query(
            `SELECT 
                di.id AS demand_item_id, 
                di.item_id, 
                di.item_code as original_item_code, 
                di.uom, 
                di.total_qty, 
                COALESCE(di.pcs, 0) as capacity_pcs, 
                di.production_schedule,
                ir.finishing_code, 
                itf.description AS finishing_description
             FROM demand_items di
             INNER JOIN item_routings ir ON ir.item_code = di.item_code 
             LEFT JOIN item_finishing itf ON itf.finishing_code = ir.finishing_code
             WHERE di.demand_id = $1`, [id]
        );

        // Jika hasil kosong, berarti data di tabel item_routings belum diisi untuk item_code tersebut
        if (itemsRes.rows.length === 0) {
            throw new Error("Gagal: Data di tabel 'item_routings' belum disetting untuk item-item di demand ini.");
        }

        // 3. Bersihkan data finishing lama untuk demand ini
        await client.query(`DELETE FROM demand_item_finishing WHERE demand_id = $1`, [id]);

        // 4. Proses Loop setiap Item
        for (const item of itemsRes.rows) {
            // Parsing jadwal packing
            const packingSchedule = typeof item.production_schedule === 'string'
                ? JSON.parse(item.production_schedule) : (item.production_schedule || []);

            // Gunakan kapasitas dari kolom pcs di demand_items, jika 0 gunakan default 100 agar tidak infinite loop
            const shiftCapacity = parseFloat(item.capacity_pcs) > 0 ? parseFloat(item.capacity_pcs) : 100;

            // Hitung jadwal mundur
            const finishingSchedule = calculateFinishingSchedule(packingSchedule, shiftCapacity);

            // Generate Calendar 15 hari (opsional, tergantung kebutuhan UI Anda)
            const finalCalendar = [];
            for (let i = 14; i >= 0; i--) {
                const d = new Date(deliveryDate);
                d.setDate(deliveryDate.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const found = finishingSchedule.find(f => f.date === dateStr);

                finalCalendar.push({
                    date: dateStr,
                    shifts: found ? found.shifts : {
                        shift1: { qty: 0, active: false, type: "finishing" },
                        shift2: { qty: 0, active: false, type: "finishing" },
                        shift3: { qty: 0, active: false, type: "finishing" }
                    }
                });
            }

            // 5. Simpan ke tabel demand_item_finishing
            // Catatan: item_code yang disimpan adalah FINISHING_CODE sesuai permintaan Anda
            await client.query(
                `INSERT INTO demand_item_finishing
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    id, 
                    item.demand_item_id, 
                    item.item_id, 
                    item.finishing_code || 'N/A', 
                    item.finishing_description || 'No Description', 
                    item.uom, 
                    item.total_qty, 
                    item.capacity_pcs, 
                    JSON.stringify(finalCalendar)
                ]
            );
        }

        // 6. Update status demand
        await client.query(`UPDATE demands SET is_finishing_generated=true WHERE id=$1`, [id]);
        
        await client.query('COMMIT');
        res.json({ message: "Generate Finishing Berhasil" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("GENERATE FINISHING ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// Di finishing.controller.js
exports.generateFinishingForItem = async (demandItemId) => {
    const client = await pool.connect();
    try {
        // PERUBAHAN: Relasi melalui item_routing
        const res = await client.query(
            `SELECT di.production_schedule, di.demand_id, di.item_id, di.item_code, 
                    di.total_qty, di.pcs, di.uom, itf.finishing_code, itf.description
             FROM demand_items di
             INNER JOIN item_routing ir ON ir.item_code = di.item_code
             INNER JOIN item_finishing itf ON itf.finishing_code = ir.finishing_code
             WHERE di.id = $1`, [demandItemId]
        );

        if (res.rows.length === 0) return;

        const row = res.rows[0];
        const packingSchedule = typeof row.production_schedule === 'string'
            ? JSON.parse(row.production_schedule) : row.production_schedule;

        // Hitung jadwal finishing (Mundur 1 Shift)
        const finishingData = calculateFinishingSchedule(packingSchedule, row.pcs);

        await client.query(
            `INSERT INTO demand_item_finishing 
             (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (demand_item_id) 
             DO UPDATE SET 
                item_code = EXCLUDED.item_code,
                description = EXCLUDED.description,
                production_schedule = EXCLUDED.production_schedule,
                total_qty = EXCLUDED.total_qty,
                pcs = EXCLUDED.pcs`,
            [
                row.demand_id, demandItemId, row.item_id, row.finishing_code,
                row.description, row.uom, row.total_qty, row.pcs, JSON.stringify(finishingData)
            ]
        );
    } catch (err) {
        console.error("Error Adaptive Finishing:", err);
    } finally {
        client.release();
    }
};

/* ==================== OTHER CONTROLLERS ==================== */

exports.getFinishingItems = async (req, res) => {
    const { demandId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM demand_item_finishing WHERE demand_id = $1 ORDER BY id ASC",
            [demandId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat data finishing items" });
    }
};

exports.updateFinishingSchedule = async (req, res) => {
    const { items } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of items) {
            await client.query(
                `UPDATE demand_item_finishing SET production_schedule=$1 WHERE id=$2`,
                [JSON.stringify(item.calendar), item.id]
            );
        }
        await client.query('COMMIT');
        res.json({ message: "Update success" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};

exports.getAllDemands = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.id, d.so_number, d.so_date, d.customer_name, d.delivery_date,
                   d.is_generated, d.is_finishing_generated, COALESCE(ci.total_items, 0) AS total_items
            FROM demands d
            LEFT JOIN (SELECT demand_id, COUNT(*) AS total_items FROM demand_items GROUP BY demand_id) ci ON d.id = ci.demand_id
            ORDER BY d.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};