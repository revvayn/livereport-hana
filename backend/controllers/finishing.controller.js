const pool = require("../db");

// 1. GET finishing by item_id
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

// 2. CREATE master finishing
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

// 3. UPDATE Master Finishing (Ini yang sering bikin error kalau tidak ada)
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

// 4. UPDATE Jadwal (Schedule) Finishing
exports.updateFinishingSchedule = async (req, res) => {
    const { items } = req.body;
    try {
        for (const item of items) {
            await pool.query(
                `UPDATE demand_finishing 
                 SET production_schedule = $1 
                 WHERE demand_item_id = $2 AND finishing_id = $3`,
                [
                    JSON.stringify(item.calendar),
                    item.demandItemId,
                    item.finishingId
                ]
            );
        }
        res.json({ message: "Jadwal finishing berhasil diperbarui" });
    } catch (err) {
        console.error("UPDATE FINISHING ERROR:", err);
        res.status(500).json({ error: "Gagal memperbarui jadwal finishing" });
    }
};

// 5. DELETE finishing
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

// 6. GENERATE Finishing Logic
exports.generateFinishing = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Ambil data packing dan target PCS
        const packingItems = await pool.query(
            `SELECT di.id AS demand_item_id, di.production_schedule, f.id AS finishing_id, di.pcs
             FROM demand_items di
             JOIN items i ON di.item_id = i.id
             JOIN item_finishing f ON f.items_id = i.id
             WHERE di.demand_id = $1`,
            [id]
        );

        for (const item of packingItems.rows) {
            if (!item.production_schedule) continue;

            const targetPcs = parseInt(item.pcs) || 0;
            let remainingQuota = targetPcs;
            const finishingDataMap = {};

            const packingCal = typeof item.production_schedule === "string"
                ? JSON.parse(item.production_schedule) : item.production_schedule;

            // 2. Flatten semua slot packing yang ada isinya ke dalam satu array
            let allPackingSlots = [];
            packingCal.forEach(day => {
                // Pastikan format tanggal bersih YYYY-MM-DD
                const cleanDate = day.date.split('T')[0];
                for (let s = 1; s <= 3; s++) {
                    const qty = day.shifts?.[`shift${s}`]?.qty || 0;
                    if (qty > 0) {
                        allPackingSlots.push({ date: cleanDate, shift: s, qty: qty });
                    }
                }
            });

            // 3. Urutkan berdasarkan waktu (Tanggal ASC, Shift ASC)
            allPackingSlots.sort((a, b) => a.date.localeCompare(b.date) || a.shift - b.shift);

            // 4. Helper Mundur 1 Shift (Anti Lompat Hari)
            const getPrevSlot = (dateStr, shift) => {
                const parts = dateStr.split('-');
                let y = parseInt(parts[0]);
                let m = parseInt(parts[1]) - 1;
                let d = parseInt(parts[2]);
                
                let dateObj = new Date(y, m, d);

                if (shift > 1) {
                    // Masih di hari yang sama
                    return { date: dateStr, shift: shift - 1 };
                } else {
                    // Mundur ke hari sebelumnya, Shift 3
                    dateObj.setDate(dateObj.getDate() - 1);
                    const yPrev = dateObj.getFullYear();
                    const mPrev = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const dPrev = String(dateObj.getDate()).padStart(2, '0');
                    return { date: `${yPrev}-${mPrev}-${dPrev}`, shift: 3 };
                }
            };

            // 5. Plotting Adaptif: Isi Finishing sampai kuota PCS habis
            for (const slot of allPackingSlots) {
                if (remainingQuota <= 0) break;

                const takeQty = Math.min(slot.qty, remainingQuota);
                const prev = getPrevSlot(slot.date, slot.shift);

                if (!finishingDataMap[prev.date]) {
                    finishingDataMap[prev.date] = {
                        date: prev.date,
                        shifts: {
                            shift1: { qty: 0 },
                            shift2: { qty: 0 },
                            shift3: { qty: 0 }
                        }
                    };
                }

                finishingDataMap[prev.date].shifts[`shift${prev.shift}`].qty += takeQty;
                remainingQuota -= takeQty;
            }

            // 6. Simpan ke Database (Delete lama, Insert baru)
            await pool.query(
                "DELETE FROM demand_finishing WHERE demand_item_id = $1 AND finishing_id = $2",
                [item.demand_item_id, item.finishing_id]
            );

            const finishingScheduleArray = Object.values(finishingDataMap).sort((a, b) => a.date.localeCompare(b.date));

            await pool.query(
                "INSERT INTO demand_finishing (demand_item_id, finishing_id, production_schedule) VALUES ($1,$2,$3)",
                [item.demand_item_id, item.finishing_id, JSON.stringify(finishingScheduleArray)]
            );
        }

        res.json({ message: "Full Finishing generated adaptively and precisely" });
    } catch (err) {
        console.error("GENERATE FINISHING ERROR:", err);
        res.status(500).json({ error: "Gagal memproses data finishing" });
    }
};

// 7. GET Items for detail view
exports.getFinishingItems = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                df.id,
                df.demand_item_id,
                df.finishing_id,
                df.production_schedule,
                f.finishing_code, -- DIAMBIL DARI item_finishing
                f.description,    -- DIAMBIL DARI item_finishing
                di.pcs AS target_pcs,
                d.delivery_date
            FROM demand_finishing df
            JOIN item_finishing f ON df.finishing_id = f.id
            JOIN demand_items di ON df.demand_item_id = di.id
            JOIN demands d ON di.demand_id = d.id
            WHERE di.demand_id = $1`, [id]
        );

        const finalRows = result.rows.map(row => {
            const deliveryDate = row.delivery_date ? new Date(row.delivery_date) : new Date();
            const scheduleMap = {};
            const existing = typeof row.production_schedule === "string" 
                ? JSON.parse(row.production_schedule) 
                : (row.production_schedule || []);
            
            existing.forEach(s => { 
                if (s.date) {
                    const cleanDate = s.date.split('T')[0]; 
                    scheduleMap[cleanDate] = s.shifts;
                }
            });

            const fullCalendar = [];
            for (let i = 13; i >= 0; i--) {
                const tempDate = new Date(deliveryDate);
                tempDate.setDate(tempDate.getDate() - i);
                const dateStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}-${String(tempDate.getDate()).padStart(2, '0')}`;
                fullCalendar.push({
                    date: dateStr,
                    shifts: scheduleMap[dateStr] || { shift1: {qty:0}, shift2: {qty:0}, shift3: {qty:0} }
                });
            }
            return { ...row, production_schedule: fullCalendar };
        });
        res.json(finalRows);
    } catch (err) {
        console.error("GET FINISHING ITEMS ERROR:", err);
        res.status(500).send("Error Database");
    }
};