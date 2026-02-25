const pool = require("../db"); // Sesuaikan dengan koneksi database Anda

// Mendapatkan jadwal berdasarkan Item ID
exports.getProductionSchedule = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query(
            "SELECT id, production_schedule FROM demand_items WHERE id = $1",
            [itemId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update/Simpan jadwal ke kolom JSONB
exports.updateProductionSchedule = async (req, res) => {
    const { itemId } = req.params;
    const { production_schedule, activeTab } = req.body; 
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (activeTab === 'packing') {
            // 1. Update Jadwal Packing di demand_items
            await client.query(
                "UPDATE demand_items SET production_schedule = $1 WHERE id = $2",
                [JSON.stringify(production_schedule), itemId]
            );

            // 2. LOGIKA ADAPTIF: Plotting Otomatis ke Finishing
            const itemRes = await client.query(
                `SELECT di.*, itf.finishing_code, itf.description as finishing_desc 
                 FROM demand_items di 
                 LEFT JOIN item_finishing itf ON itf.items_id = di.item_id 
                 WHERE di.id = $1`, [itemId]
            );
            const item = itemRes.rows[0];

            const finishingQtyMap = {};
            const getNextSlot = (dateStr, shiftNum) => {
                let d = new Date(dateStr);
                if (shiftNum < 3) return { date: dateStr, shift: shiftNum + 1 };
                d.setDate(d.getDate() + 1);
                return { date: d.toISOString().split('T')[0], shift: 1 };
            };

            // Hitung ulang jadwal finishing berdasarkan packing baru
            production_schedule.forEach(day => {
                const cleanDate = day.date.split('T')[0];
                for (let s = 1; s <= 3; s++) {
                    const qty = day.shifts?.[`shift${s}`]?.qty || 0;
                    if (qty > 0) {
                        const next = getNextSlot(cleanDate, s);
                        if (!finishingQtyMap[next.date]) finishingQtyMap[next.date] = {};
                        finishingQtyMap[next.date][`shift${next.shift}`] = (finishingQtyMap[next.date][`shift${next.shift}`] || 0) + qty;
                    }
                }
            });

            // Bangun Array Kalender Finishing
            const finalFinishingSchedule = Object.keys(finishingQtyMap).map(date => ({
                date: date,
                shifts: {
                    shift1: { qty: finishingQtyMap[date].shift1 || 0, active: !!finishingQtyMap[date].shift1 },
                    shift2: { qty: finishingQtyMap[date].shift2 || 0, active: !!finishingQtyMap[date].shift2 },
                    shift3: { qty: finishingQtyMap[date].shift3 || 0, active: !!finishingQtyMap[date].shift3 }
                }
            }));

            // 3. Upsert ke tabel demand_item_finishing
            // Hapus yang lama, masukkan yang baru hasil kalkulasi adaptif
            await client.query(`DELETE FROM demand_item_finishing WHERE demand_item_id = $1`, [itemId]);
            await client.query(
                `INSERT INTO demand_item_finishing 
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [item.demand_id, itemId, item.item_id, item.finishing_code || item.item_code, 
                 item.finishing_desc || item.description, item.uom, item.total_qty, item.pcs, JSON.stringify(finalFinishingSchedule)]
            );
        } else {
            // Jika user mengedit tab Finishing secara manual
            await client.query(
                "UPDATE demand_item_finishing SET production_schedule = $1 WHERE demand_item_id = $2",
                [JSON.stringify(production_schedule), itemId]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Jadwal Berhasil Disinkronkan!" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};