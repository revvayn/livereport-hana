const pool = require("../db");

/* ==================== HELPER ==================== */
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
        if (shift > 1) {
            // Shift 2 -> Finishing Shift 1 (Hari yang sama)
            // Shift 3 -> Finishing Shift 2 (Hari yang sama)
            return { date: dateStr, shift: shift - 1 };
        } else {
            // Shift 1 -> Finishing Shift 3 (Hari sebelumnya / H-1)
            dateObj.setDate(dateObj.getDate() - 1);
            return { date: dateObj.toISOString().split('T')[0], shift: 3 };
        }
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

        // Ambil data demand untuk mendapatkan delivery_date
        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [id]);
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        // 1. CEK ITEM YANG TIDAK ADA DI MASTER FINISHING
        // Kita bandingkan item_code di SO dengan item_code di Master Finishing
        const missingCheck = await client.query(
            `SELECT DISTINCT di.item_code 
             FROM demand_items di
             LEFT JOIN item_finishing itf ON itf.item_code = di.item_code
             WHERE di.demand_id = $1 AND itf.id IS NULL`, [id]
        );

        if (missingCheck.rows.length > 0) {
            const listMissing = missingCheck.rows.map(row => row.item_code).join(", ");
            throw new Error(`Item berikut belum ada di Master Finishing: [ ${listMissing} ]`);
        }

        // 2. AMBIL DATA DENGAN JOIN (itf.item_code sebagai jembatan)
        const itemsRes = await client.query(
            `SELECT 
                di.id AS demand_item_id, 
                di.item_id, 
                di.item_code, 
                di.uom, 
                di.total_qty, 
                di.pcs, 
                di.production_schedule,
                itf.finishing_code,    -- Ini Kode Finishing Asli dari Master
                itf.description AS finishing_description
             FROM demand_items di
             INNER JOIN item_finishing itf ON itf.item_code = di.item_code 
             WHERE di.demand_id = $1`, [id]
        );

        // Bersihkan data lama untuk demand ini
        await client.query(`DELETE FROM demand_item_finishing WHERE demand_id = $1`, [id]);

        for (const item of itemsRes.rows) {
            const packingSchedule = typeof item.production_schedule === 'string' 
                ? JSON.parse(item.production_schedule) : (item.production_schedule || []);
            
            const finishingSchedule = calculateFinishingSchedule(packingSchedule);
            
            const finalCalendar = [];
            for (let i = 14; i >= -1; i--) {
                const d = new Date(deliveryDate);
                d.setDate(d.getDate() - i);
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

            // Simpan ke tabel transaksi finishing
            // Kita simpan itf.finishing_code sebagai item_code di tabel tujuan
            await client.query(
                `INSERT INTO demand_item_finishing
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    id, 
                    item.demand_item_id, 
                    item.item_id, 
                    item.finishing_code, // Kode finishing asli
                    item.finishing_description, 
                    item.uom, 
                    item.total_qty, 
                    item.pcs, 
                    JSON.stringify(finalCalendar)
                ]
            );
        }

        await client.query(`UPDATE demands SET is_finishing_generated=true WHERE id=$1`, [id]);
        await client.query('COMMIT');
        res.json({ message: "Generate Finishing Berhasil" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Generate Error:", err.message);
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