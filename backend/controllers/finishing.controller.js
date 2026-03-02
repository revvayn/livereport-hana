const pool = require("../db");

/* ==================== HELPER ==================== */
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
    const capacityPerShift = 50; // Sesuaikan dengan kapasitas shift Anda
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

/* ==================== MASTER DATA CONTROLLERS ==================== */

exports.getFinishingByItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM item_finishing WHERE items_id = $1 ORDER BY id ASC",
            [itemId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil data master finishing" });
    }
};

exports.createFinishing = async (req, res) => {
    // Tambahkan item_code di destructuring req.body
    const { items_id, item_code, finishing_code, description, warehouse } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO item_finishing (items_id, item_code, finishing_code, description, warehouse) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [items_id, item_code, finishing_code, description, warehouse]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menambah master finishing" });
    }
};

exports.updateFinishing = async (req, res) => {
    const { id } = req.params;
    // Pastikan item_code juga ikut diupdate jika sewaktu-waktu master item berubah
    const { item_code, finishing_code, description, warehouse } = req.body;
    try {
        const result = await pool.query(
            `UPDATE item_finishing 
             SET item_code=$1, finishing_code=$2, description=$3, warehouse=$4 
             WHERE id=$5 RETURNING *`,
            [item_code, finishing_code, description, warehouse, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal update data finishing" });
    }
};

exports.deleteFinishing = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM item_finishing WHERE id = $1", [id]);
        res.json({ message: "Data finishing dihapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus data finishing" });
    }
};

/* ==================== GENERATE LOGIC (STRICT BY ITEM_CODE RELATION) ==================== */

exports.generateFinishing = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [id]);
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        const itemsRes = await client.query(
            `SELECT di.id AS demand_item_id, di.item_id, di.item_code, di.uom, 
                    di.total_qty, di.pcs, di.production_schedule,
                    itf.finishing_code, itf.description AS finishing_description
             FROM demand_items di
             INNER JOIN item_finishing itf ON itf.item_code = di.item_code 
             WHERE di.demand_id = $1`, [id]
        );

        await client.query(`DELETE FROM demand_item_finishing WHERE demand_id = $1`, [id]);

        for (const item of itemsRes.rows) {
            const packingSchedule = typeof item.production_schedule === 'string'
                ? JSON.parse(item.production_schedule) : (item.production_schedule || []);

            // DINAMIS: Gunakan item.pcs sebagai kapasitas per shift
            const finishingSchedule = calculateFinishingSchedule(packingSchedule, item.pcs);

            const finalCalendar = [];
            const days = 15;

            for (let i = days - 1; i >= 0; i--) {
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

            await client.query(
                `INSERT INTO demand_item_finishing
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [id, item.demand_item_id, item.item_id, item.finishing_code, 
                 item.finishing_description, item.uom, item.total_qty, item.pcs, JSON.stringify(finalCalendar)]
            );
        }

        await client.query(`UPDATE demands SET is_finishing_generated=true WHERE id=$1`, [id]);
        await client.query('COMMIT');
        res.json({ message: "Generate Finishing Berhasil" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};

// Di finishing.controller.js
exports.generateFinishingForItem = async (demandItemId) => {
    const client = await pool.connect();
    try {
        // 1. Ambil data packing terbaru
        const res = await client.query(
            `SELECT di.production_schedule, di.demand_id, di.item_id, di.item_code, 
                    di.total_qty, di.pcs, di.uom, itf.finishing_code, itf.description
             FROM demand_items di
             INNER JOIN item_finishing itf ON itf.item_code = di.item_code
             WHERE di.id = $1`, [demandItemId]
        );

        if (res.rows.length === 0) return;

        const row = res.rows[0];
        const packingSchedule = typeof row.production_schedule === 'string'
            ? JSON.parse(row.production_schedule) : row.production_schedule;

        // 2. Hitung jadwal finishing (Mundur 1 Shift)
        const finishingData = calculateFinishingSchedule(packingSchedule);

        // 3. Simpan ke database (Upsert berdasarkan demand_item_id)
        await client.query(
            `INSERT INTO demand_item_finishing 
             (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (demand_item_id) 
             DO UPDATE SET 
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