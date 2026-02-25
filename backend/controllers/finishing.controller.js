const pool = require("../db");


// GET finishing by item_id (Digunakan saat user pilih Item di Frontend)
exports.getFinishingByItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM item_finishing WHERE items_id = $1 ORDER BY id ASC",
      [itemId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data finishing" });
  }
};

// CREATE finishing
exports.createFinishing = async (req, res) => {
  const { items_id, finishing_code, description, warehouse } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO item_finishing (items_id, finishing_code, description, warehouse) VALUES ($1, $2, $3, $4) RETURNING *",
      [items_id, finishing_code, description, warehouse]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah data finishing" });
  }
};

// UPDATE finishing
exports.updateFinishing = async (req, res) => {
  const { id } = req.params;
  const { finishing_code, description, warehouse } = req.body;
  try {
    const result = await pool.query(
      "UPDATE item_finishing SET finishing_code=$1, description=$2, warehouse=$3 WHERE id=$4 RETURNING *",
      [finishing_code, description, warehouse, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal update data finishing" });
  }
};

// DELETE finishing
exports.deleteFinishing = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM item_finishing WHERE id = $1", [id]);
    res.json({ message: "Data finishing dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus data finishing" });
  }
};

/* ==================== HELPER (Tetap Sama) ==================== */
const calculateFinishingSchedule = (packingSchedule) => {
    if (!packingSchedule || !Array.isArray(packingSchedule)) return [];
    let allPackingSlots = [];
    packingSchedule.forEach(day => {
        const cleanDate = typeof day.date === 'string' ? day.date.split('T')[0] : day.date;
        for (let s = 1; s <= 3; s++) {
            const qty = day.shifts?.[`shift${s}`]?.qty || 0;
            if (qty > 0) allPackingSlots.push({ date: cleanDate, shift: s, qty });
        }
    });

    const finishingDataMap = {};
    const getPrevSlot = (dateStr, shift) => {
        const dateObj = new Date(dateStr);
        if (shift > 1) return { date: dateStr, shift: shift - 1 };
        dateObj.setDate(dateObj.getDate() - 1);
        return { date: dateObj.toISOString().split('T')[0], shift: 3 };
    };

    allPackingSlots.forEach(slot => {
        const prev = getPrevSlot(slot.date, slot.shift);
        if (!finishingDataMap[prev.date]) {
            finishingDataMap[prev.date] = {
                date: prev.date,
                shifts: {
                    shift1: { qty: 0, active: false, type: "finishing" },
                    shift2: { qty: 0, active: false, type: "finishing" },
                    shift3: { qty: 0, active: false, type: "finishing" }
                }
            };
        }
        finishingDataMap[prev.date].shifts[`shift${prev.shift}`].qty += slot.qty;
        finishingDataMap[prev.date].shifts[`shift${prev.shift}`].active = true;
    });
    return Object.values(finishingDataMap).sort((a, b) => a.date.localeCompare(b.date));
};

/* ==================== CONTROLLERS (FIXED) ==================== */

exports.generateFinishing = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Ambil info demand untuk delivery_date
        const demandRes = await client.query(
            `SELECT delivery_date FROM demands WHERE id = $1`, [id]
        );
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        // 2. Ambil items dari demand_items (Packing)
        const itemsRes = await client.query(
            `SELECT 
                di.id AS demand_item_id,
                di.item_id,
                di.uom,
                di.total_qty,
                di.pcs,
                di.production_schedule,
                COALESCE(itf.finishing_code, di.item_code) AS item_code,
                COALESCE(itf.description, di.description) AS description
             FROM demand_items di
             LEFT JOIN item_finishing itf ON itf.items_id = di.item_id
             WHERE di.demand_id = $1`,
            [id]
        );

        if (itemsRes.rows.length === 0) throw new Error("Packing masih kosong.");

        // 3. Bersihkan data lama (Boleh diaktifkan agar tidak menumpuk baris yang sama)
        await client.query(`DELETE FROM demand_item_finishing WHERE demand_id = $1`, [id]);

        // 4. Proses setiap item
        for (const item of itemsRes.rows) {
            let packingSchedule = [];
            try {
                packingSchedule = typeof item.production_schedule === 'string' 
                    ? JSON.parse(item.production_schedule) 
                    : (item.production_schedule || []);
            } catch (e) { packingSchedule = []; }

            const finishingQtyMap = {};

            // LOGIKA UTAMA: Maju 1 Shift (Sequential)
            const getNextSlot = (dateStr, shiftNum) => {
                let d = new Date(dateStr);
                if (shiftNum < 3) {
                    // Shift 1 -> 2, Shift 2 -> 3 (Hari yang sama)
                    return { date: dateStr, shift: shiftNum + 1 };
                } else {
                    // Shift 3 -> Pindah ke Shift 1 BESOKNYA
                    d.setDate(d.getDate() + 1);
                    return { date: d.toISOString().split('T')[0], shift: 1 };
                }
            };

            // Olah jadwal packing menjadi jadwal finishing
            packingSchedule.forEach(day => {
                const cleanDate = day.date.split('T')[0];
                for (let s = 1; s <= 3; s++) {
                    const qty = day.shifts?.[`shift${s}`]?.qty || 0;
                    if (qty > 0) {
                        const next = getNextSlot(cleanDate, s);
                        if (!finishingQtyMap[next.date]) finishingQtyMap[next.date] = {};
                        
                        // Akumulasi qty jika ada beberapa packing slot yang masuk ke shift finishing yang sama
                        finishingQtyMap[next.date][`shift${next.shift}`] = 
                            (finishingQtyMap[next.date][`shift${next.shift}`] || 0) + qty;
                    }
                }
            });

            // 5. Bangun Kalender 14 hari (ditambah H+1 untuk menampung shift yang lari ke esok hari)
            const finalCalendar = [];
            for (let i = 14; i >= -1; i--) { // i = -1 menampung H+1 dari Delivery Date
                const d = new Date(deliveryDate);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const fDay = finishingQtyMap[dateStr] || {};
                
                finalCalendar.push({
                    date: dateStr,
                    shifts: {
                        shift1: { qty: fDay.shift1 || 0, active: !!fDay.shift1, type: "finishing" },
                        shift2: { qty: fDay.shift2 || 0, active: !!fDay.shift2, type: "finishing" },
                        shift3: { qty: fDay.shift3 || 0, active: !!fDay.shift3, type: "finishing" }
                    }
                });
            }

            // 6. INSERT ke tabel demand_item_finishing
            await client.query(
                `INSERT INTO demand_item_finishing
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    id, 
                    item.demand_item_id, 
                    item.item_id, 
                    item.item_code, 
                    item.description,
                    item.uom, 
                    item.total_qty, 
                    item.pcs, 
                    JSON.stringify(finalCalendar)
                ]
            );
        }

        // 7. Update status demand
        await client.query(`UPDATE demands SET is_finishing_generated=true WHERE id=$1`, [id]);
        
        await client.query('COMMIT');
        res.json({ message: "Generate Finishing Berhasil" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};

// HAPUS fungsi getFinishingItems yang lama, gunakan yang ini:
exports.getFinishingItems = async (req, res) => {
    const { demandId } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM demand_item_finishing WHERE demand_id=$1 ORDER BY id ASC`, [demandId]
        );

        const rows = result.rows.map(row => {
            let schedule = [];
            try {
                schedule = typeof row.production_schedule === 'string' 
                    ? JSON.parse(row.production_schedule) 
                    : (row.production_schedule || []);
            } catch (e) {
                console.error("Parse error for ID:", row.id);
                schedule = [];
            }
            return { ...row, production_schedule: schedule };
        });

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFinishingSchedule = async (req, res) => {
    const { items } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of items) {
            // Stringify sebelum simpan
            const scheduleString = JSON.stringify(item.calendar);
            await client.query(
                `UPDATE demand_item_finishing SET production_schedule=$1 WHERE id=$2`,
                [scheduleString, item.id]
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
            SELECT 
              d.id,
              d.so_number, 
              d.so_date, 
              d.customer_name, 
              d.delivery_date,
              d.is_generated,
              d.is_finishing_generated,
              COALESCE(ci.total_items, 0) AS total_items
            FROM demands d
            LEFT JOIN (
              SELECT demand_id, COUNT(*) AS total_items
              FROM demand_items GROUP BY demand_id
            ) ci ON d.id = ci.demand_id
            ORDER BY d.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};