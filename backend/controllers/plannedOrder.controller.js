const pool = require("../db");

// --- TAMBAHKAN DEKLARASI INI DI ATAS ---
// Anda bisa menentukan angka ini secara manual atau mengambilnya dari DB
const LIMIT_KAPASITAS = 1000;

// 1. Ambil Semua Demand (List Utama)
exports.getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id as demand_id, 
                d.so_number as reference_no,
                d.delivery_date,
                d.customer_name,
                d.has_schedule,
                (
                    SELECT COUNT(*) 
                    FROM demand_items 
                    WHERE demand_id = d.id
                ) as total_items
            FROM demands d
            ORDER BY d.created_at DESC
        `;

        const result = await pool.query(query);
        res.json(result.rows);

    } catch (err) {
        console.error("DATABASE ERROR:", err.message);
        res.status(500).json({ error: "Gagal memuat data order" });
    }
};


// 2. Backward Scheduling Logic
exports.autoGenerateSOSchedule = async (req, res) => {
    const { demand_id, delivery_date } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const itemsRes = await client.query(
            `SELECT item_id, pcs FROM demand_items WHERE demand_id = $1`,
            [demand_id]
        );

        for (const item of itemsRes.rows) {
            // 1. CEK: Apakah sudah ada plot PACKING untuk item ini?
            const existingPacking = await client.query(
                `SELECT date, shift FROM production_order_plots 
                 WHERE demand_id = $1 AND item_id = $2 
                 AND operation_id IN (SELECT id FROM operations WHERE UPPER(operation_name) LIKE '%PACKING%')
                 ORDER BY date ASC, shift ASC LIMIT 1`,
                [demand_id, item.item_id]
            );

            let startPointDate;
            let startPointShift;

            if (existingPacking.rows.length > 0) {
                // Jika ada packing, mulai dari shift SEBELUM packing terkecil
                const packDate = new Date(existingPacking.rows[0].date);
                startPointShift = existingPacking.rows[0].shift - 1;
                startPointDate = packDate;

                if (startPointShift < 1) {
                    startPointDate.setDate(startPointDate.getDate() - 1);
                    startPointShift = 3;
                }
            } else {
                // Jika BELUM ada packing, mulai dari delivery_date - 1
                const [y, m, d] = delivery_date.split("T")[0].split("-");
                startPointDate = new Date(y, m - 1, d);
                startPointDate.setDate(startPointDate.getDate() - 1);
                startPointShift = 3;
            }

            // 2. Ambil Routing SELAIN Packing (karena packing dianggap sudah ada atau manual)
            // Kita urutkan backward
            const routingRes = await client.query(
                `SELECT operation_id, machine_id 
                 FROM item_routings
                 WHERE item_id = $1 
                 AND operation_id NOT IN (SELECT id FROM operations WHERE UPPER(operation_name) LIKE '%PACKING%')
                 ORDER BY sequence DESC`,
                [item.item_id]
            );

            // Hapus plot LAMA yang BUKAN packing sebelum generate ulang (Opsional)
            await client.query(
                `DELETE FROM production_order_plots 
                 WHERE demand_id = $1 AND item_id = $2 
                 AND operation_id NOT IN (SELECT id FROM operations WHERE UPPER(operation_name) LIKE '%PACKING%')`,
                [demand_id, item.item_id]
            );

            let currentDate = new Date(startPointDate);
            let currentShift = startPointShift;

            for (const route of routingRes.rows) {
                const dateString = currentDate.toISOString().split('T')[0];

                await client.query(
                    `INSERT INTO production_order_plots
                     (demand_id, item_id, operation_id, machine_id, date, shift, qty)
                     VALUES ($1,$2,$3,$4,$5,$6,$7)
                     ON CONFLICT (demand_id, item_id, date, shift) DO UPDATE 
                     SET operation_id = EXCLUDED.operation_id, qty = EXCLUDED.qty`,
                    [demand_id, item.item_id, route.operation_id, route.machine_id, dateString, currentShift, item.pcs]
                );

                currentShift--;
                if (currentShift < 1) {
                    currentDate.setDate(currentDate.getDate() - 1);
                    currentShift = 3;
                }
            }
        }

        await client.query(`UPDATE demands SET has_schedule = true WHERE id = $1`, [demand_id]);
        await client.query("COMMIT");
        res.json({ message: "Jadwal berhasil diperbarui (Backward dari Packing)." });

    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};


// 3. Fetch Matrix Data
exports.getScheduleByDemand = async (req, res) => {
    try {
        const { demand_id } = req.params;

        const matrixQuery = `
SELECT 
    di.item_id,
    i.item_code,
    i.description,
    i.uom,
    di.pcs,

    pop.id as plot_id,
    pop.date,
    pop.shift,
    pop.qty,
    pop.operation_id,
    ops.operation_name,

    CASE 
        WHEN pop.demand_id = $1 
             AND UPPER(ops.operation_name) LIKE '%PACKING%' 
             THEN 'PACKING'
        WHEN pop.demand_id = $1 
             THEN 'CURRENT'
        WHEN pop.demand_id IS NOT NULL 
             THEN 'OTHER'
        ELSE NULL
    END as plot_type

FROM demand_items di
JOIN items i ON di.item_id = i.id

LEFT JOIN production_order_plots pop
    ON di.item_id = pop.item_id
    AND (
        pop.demand_id = $1
        OR pop.operation_id IN (
            SELECT operation_id FROM item_routings
            WHERE item_id = di.item_id
        )
    )

LEFT JOIN operations ops
    ON pop.operation_id = ops.id

WHERE di.demand_id = $1
ORDER BY i.item_code, pop.date, pop.shift
`;


        const routingQuery = `
            SELECT DISTINCT ops.id, ops.operation_name 
            FROM item_routings ir
            JOIN operations ops ON ir.operation_id = ops.id
            WHERE ir.item_id IN (
                SELECT item_id FROM demand_items WHERE demand_id = $1
            )
            ORDER BY ops.id
        `;

        const [matrixRes, routingRes] = await Promise.all([
            pool.query(matrixQuery, [demand_id]),
            pool.query(routingQuery, [demand_id])
        ]);

        res.json({
            plots: matrixRes.rows,
            availableOperations: routingRes.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};


// 5. Toggle Manual Plot (PERBAIKAN LIMIT_KAPASITAS)
exports.toggleManualPlot = async (req, res) => {
    const { plot_id, demand_id, item_id, operation_id, date, shift, qty, action } = req.body;
    const LIMIT_KAPASITAS = 1000; // Pastikan ini ada

    try {
        if (action === "ADD") {
            const inputQty = parseFloat(qty || 0);

            // 1. Ambil Routing & Machine
            const routing = await pool.query(
                `SELECT machine_id FROM item_routings WHERE item_id = $1 AND operation_id = $2`,
                [item_id, operation_id]
            );
            if (routing.rows.length === 0) return res.status(400).json({ error: "Routing tidak ditemukan" });
            const machine_id = routing.rows[0].machine_id;

            // 2. Cek Kapasitas per Shift per Operasi
            const capacityCheck = await pool.query(
                `SELECT COALESCE(SUM(qty), 0) as total FROM production_order_plots 
                 WHERE date = $1 AND shift = $2 AND operation_id = $3 AND id != COALESCE($4, 0)`,
                [date, shift, operation_id, plot_id || 0]
            );
            const totalUsed = parseFloat(capacityCheck.rows[0].total);

            if (totalUsed + inputQty > LIMIT_KAPASITAS) {
                return res.status(400).json({
                    error: `Kapasitas penuh! Terpakai: ${totalUsed}, Max: ${LIMIT_KAPASITAS}`
                });
            }

            // 3. Simpan dengan ON CONFLICT (agar tidak double plot di sel yang sama)
            await pool.query(
                `INSERT INTO production_order_plots (demand_id, item_id, operation_id, machine_id, date, shift, qty)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (demand_id, item_id, date, shift)
                 DO UPDATE SET operation_id = EXCLUDED.operation_id, qty = EXCLUDED.qty, machine_id = EXCLUDED.machine_id`,
                [demand_id, item_id, operation_id, machine_id, date, shift, inputQty]
            );
        } else {
            // DELETE
            await pool.query(`DELETE FROM production_order_plots WHERE id = $1`, [plot_id]);
        }
        res.json({ message: "Success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 6. Simpan Demand Baru
exports.saveDemand = async (req, res) => {
    const { header, items } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Simpan Header Demand
        const dRes = await client.query(
            `INSERT INTO demands (so_number, customer_name, delivery_date) 
             VALUES ($1, $2, $3) RETURNING id`,
            [header.soNo, header.customer, header.deliveryDate] // Pastikan delivery_date ikut disimpan
        );

        const demandId = dRes.rows[0].id;

        // 2. Simpan Items
        for (const item of items) {
            // CARI item_id asli dari tabel items berdasarkan item_code
            const itemLookup = await client.query(
                `SELECT id FROM items WHERE item_code = $1`,
                [item.itemCode]
            );

            if (itemLookup.rows.length === 0) {
                throw new Error(`Item Code ${item.itemCode} tidak ditemukan di master data items.`);
            }

            const realItemId = itemLookup.rows[0].id;
            const scheduleData = item.calendar ? JSON.stringify(item.calendar) : JSON.stringify([]);

            await client.query(
                `INSERT INTO demand_items (
                    demand_id, 
                    item_id,       -- TAMBAHKAN INI: Supaya relasi JOIN di matrix jalan
                    item_code, 
                    description, 
                    uom, 
                    total_qty, 
                    pcs, 
                    production_schedule
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    demandId,
                    realItemId,
                    item.itemCode,
                    item.description || '',
                    item.uom || '',
                    item.qty,
                    item.pcs || 0,
                    scheduleData
                ]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Demand dan Jadwal Berhasil disimpan", demand_id: demandId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("SAVE DEMAND ERROR:", err.message);
        res.status(500).json({ error: "Gagal menyimpan: " + err.message });
    } finally {
        client.release();
    }
};