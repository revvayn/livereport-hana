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
    TO_CHAR(d.delivery_date, 'YYYY-MM-DD') as delivery_date,
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
    const { demand_id } = req.body;
    const client = await pool.connect();

    // Helper mundur 1 hari (aman timezone)
    const subtractOneDay = (dateStr) => {
        const [y, m, d] = dateStr.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        date.setUTCDate(date.getUTCDate() - 1);

        return date.getUTCFullYear() + "-" +
            String(date.getUTCMonth() + 1).padStart(2, "0") + "-" +
            String(date.getUTCDate()).padStart(2, "0");
    };

    try {
        await client.query("BEGIN");

        // 🔹 Ambil delivery_date langsung dari DB
        const demandRes = await client.query(
            `SELECT delivery_date FROM demands WHERE id = $1`,
            [demand_id]
        );

        if (demandRes.rows.length === 0) {
            throw new Error("Demand tidak ditemukan");
        }

        const rawDelivery = demandRes.rows[0].delivery_date;

        if (!rawDelivery) {
            throw new Error("Delivery date kosong");
        }

        const delivery_date =
            typeof rawDelivery === "string"
                ? rawDelivery
                : rawDelivery.toISOString().split("T")[0];

        const itemsRes = await client.query(
            `SELECT item_id, pcs FROM demand_items WHERE demand_id = $1`,
            [demand_id]
        );

        for (const item of itemsRes.rows) {

            const existingPacking = await client.query(
                `SELECT date, shift FROM production_order_plots 
                 WHERE demand_id = $1 
                 AND item_id = $2 
                 AND operation_id IN (
                     SELECT id FROM operations 
                     WHERE UPPER(operation_name) LIKE '%PACKING%'
                 )
                 ORDER BY date DESC, shift DESC 
                 LIMIT 1`,
                [demand_id, item.item_id]
            );

            let currentDate;
            let currentShift;

            if (existingPacking.rows.length > 0) {
                const rawDate = existingPacking.rows[0].date;

                currentDate =
                    typeof rawDate === "string"
                        ? rawDate
                        : rawDate.toISOString().split("T")[0];

                currentShift = Number(existingPacking.rows[0].shift) - 1;
            } else {
                currentDate = subtractOneDay(delivery_date);
                currentShift = 3;
            }

            if (currentShift < 1) {
                currentDate = subtractOneDay(currentDate);
                currentShift = 3;
            }

            const routingRes = await client.query(
                `SELECT operation_id, machine_id 
                 FROM item_routings
                 WHERE item_id = $1 
                 AND operation_id NOT IN (
                     SELECT id FROM operations 
                     WHERE UPPER(operation_name) LIKE '%PACKING%'
                 )
                 ORDER BY sequence DESC`,
                [item.item_id]
            );

            await client.query(
                `DELETE FROM production_order_plots 
                 WHERE demand_id = $1 
                 AND item_id = $2 
                 AND operation_id NOT IN (
                     SELECT id FROM operations 
                     WHERE UPPER(operation_name) LIKE '%PACKING%'
                 )`,
                [demand_id, item.item_id]
            );

            for (const route of routingRes.rows) {

                await client.query(
                    `INSERT INTO production_order_plots 
                     (demand_id, item_id, operation_id, machine_id, date, shift, qty)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (demand_id, item_id, operation_id, date, shift)
                     DO UPDATE SET 
                         qty = EXCLUDED.qty,
                         machine_id = EXCLUDED.machine_id`,
                    [
                        demand_id,
                        item.item_id,
                        route.operation_id,
                        route.machine_id,
                        currentDate,
                        currentShift,
                        item.pcs
                    ]
                );

                // Mundur shift
                currentShift--;

                if (currentShift < 1) {
                    currentDate = subtractOneDay(currentDate);
                    currentShift = 3;
                }
            }
        }

        await client.query(
            `UPDATE demands SET has_schedule = true WHERE id = $1`,
            [demand_id]
        );

        await client.query("COMMIT");

        res.json({ message: "Jadwal berhasil dibuat (Backward)." });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("GENERATE ERROR:", err);
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
                TO_CHAR(pop.date, 'YYYY-MM-DD') as date, 
                pop.shift, 
                pop.qty, 
                pop.operation_id, 
                ops.operation_name,
                CASE 
                    WHEN UPPER(TRIM(ops.operation_name)) LIKE '%PACKING%' THEN 'PACKING'
                    ELSE 'CURRENT'
                END as plot_type
            FROM demand_items di
            JOIN items i ON di.item_id = i.id
            LEFT JOIN production_order_plots pop 
                ON di.item_id = pop.item_id 
                AND pop.demand_id = di.demand_id  -- 🔥 FIX PENTING
            LEFT JOIN operations ops 
                ON pop.operation_id = ops.id
            WHERE di.demand_id = $1
            ORDER BY i.item_code, pop.date, pop.shift
        `;

        const [matrix, ops] = await Promise.all([
            pool.query(matrixQuery, [demand_id]),
            pool.query(`SELECT id, operation_name FROM operations ORDER BY operation_name`)
        ]);

        res.json({
            plots: matrix.rows,
            availableOperations: ops.rows
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// 5. Toggle Manual Plot (PERBAIKAN LIMIT_KAPASITAS)
exports.toggleManualPlot = async (req, res) => {
    const { plot_id, demand_id, item_id, operation_id, date, shift, qty, action } = req.body;
    const LIMIT_KAPASITAS = 1000;

    try {
        if (action === "ADD") {
            const inputQty = parseFloat(qty || 0);

            // 1. VALIDASI PER OPERASI: Cek sisa butuh untuk operasi spesifik ini
            const currentPlots = await pool.query(
                `SELECT SUM(qty) as total FROM production_order_plots 
                 WHERE demand_id = $1 AND item_id = $2 AND operation_id = $3 AND id != COALESCE($4, 0)`,
                [demand_id, item_id, operation_id, plot_id || 0]
            );
            const alreadyPlottedForThisOp = parseFloat(currentPlots.rows[0].total || 0);

            const demandCheck = await pool.query(
                `SELECT pcs FROM demand_items WHERE demand_id = $1 AND item_id = $2`,
                [demand_id, item_id]
            );
            const totalNeeded = parseFloat(demandCheck.rows[0]?.pcs || 0);

            // Sekarang membandingkan qty per operasi vs total kebutuhan PCS
            if (alreadyPlottedForThisOp + inputQty > totalNeeded) {
                return res.status(400).json({
                    error: `Qty Operasi ini melebihi kebutuhan! Sisa butuh untuk proses ini: ${totalNeeded - alreadyPlottedForThisOp}`
                });
            }

            // 2. Cek Kapasitas Global (Kapasitas Mesin/Operasi di hari & shift tersebut)
            const capacityCheck = await pool.query(
                `SELECT SUM(qty) as total FROM production_order_plots 
                 WHERE date = $1 AND shift = $2 AND operation_id = $3 AND id != COALESCE($4, 0)`,
                [date, shift, operation_id, plot_id || 0]
            );
            const totalUsedInShift = parseFloat(capacityCheck.rows[0].total || 0);

            if (totalUsedInShift + inputQty > LIMIT_KAPASITAS) {
                return res.status(400).json({
                    error: `Kapasitas Operasi Penuh! Terpakai: ${totalUsedInShift}, Limit: ${LIMIT_KAPASITAS}`
                });
            }

            // 3. Ambil Machine ID Default dari Routing
            const routing = await pool.query(
                `SELECT machine_id FROM item_routings WHERE item_id = $1 AND operation_id = $2 LIMIT 1`,
                [item_id, operation_id]
            );
            const machine_id = routing.rows[0]?.machine_id;

            // 4. UPSERT: Gunakan ON CONFLICT yang lebih spesifik jika perlu
            await pool.query(
                `INSERT INTO production_order_plots (demand_id, item_id, operation_id, machine_id, date, shift, qty)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (demand_id, item_id, operation_id, date, shift) -- Harus sama dengan Unique Index di DB
                 DO UPDATE SET 
                    qty = EXCLUDED.qty, 
                    machine_id = EXCLUDED.machine_id`,
                [demand_id, item_id, operation_id, machine_id, date, shift, inputQty]
            );
        } else {
            await pool.query(
                `DELETE FROM production_order_plots 
                 WHERE id = $1 AND demand_id = $2`,
                [plot_id, demand_id]
            );

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

// 3. Ambil Item Demand (Untuk Matrix)
exports.getDemandItems = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM demand_items WHERE demand_id = $1", [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};