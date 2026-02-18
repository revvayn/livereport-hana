const pool = require("../db");

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
                (SELECT COUNT(*) FROM demand_items WHERE demand_id = d.id) as total_items
            FROM demands d
            ORDER BY d.created_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("DATABASE ERROR:", err.message);
        res.status(500).json({ error: "Gagal memuat data order" });
    }
};

// 2. Backward Scheduling Logic (Perbaikan Transaksi & Penanggalan)
exports.autoGenerateSOSchedule = async (req, res) => {
    const { demand_id, delivery_date } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Ambil item dan routing-nya
        const itemsRes = await client.query(
            `SELECT di.item_id, di.pcs 
             FROM demand_items di 
             WHERE di.demand_id = $1`,
            [demand_id]
        );

        if (itemsRes.rows.length === 0) throw new Error("Item demand tidak ditemukan");

        // Hapus plot lama SO ini
        await client.query(`DELETE FROM production_order_plots WHERE demand_id = $1`, [demand_id]);

        for (const item of itemsRes.rows) {
            const routingRes = await client.query(
                `SELECT operation_id, machine_id, sequence 
                 FROM item_routings WHERE item_id = $1 ORDER BY sequence DESC`,
                [item.item_id]
            );

            if (routingRes.rows.length === 0) continue;

            let currentDate = new Date(delivery_date);
            let currentShift = 3;

            for (const route of routingRes.rows) {
                await client.query(
                    `INSERT INTO production_order_plots 
                    (demand_id, item_id, operation_id, machine_id, date, shift, qty) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        demand_id, item.item_id, route.operation_id, route.machine_id,
                        currentDate.toISOString().split('T')[0],
                        currentShift, item.pcs
                    ]
                );

                // Logika Mundur
                currentShift--;
                if (currentShift < 1) {
                    currentShift = 3;
                    currentDate.setDate(currentDate.getDate() - 1);
                }
            }
        }

        await client.query(`UPDATE demands SET has_schedule = true WHERE id = $1`, [demand_id]);
        await client.query('COMMIT');
        res.json({ message: "Jadwal berhasil digenerate otomatis." });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// 3. Fetch Matrix Data (Kunci Agar SO Lain Terlihat)
exports.getScheduleByDemand = async (req, res) => {
    try {
        const { demand_id } = req.params;

        const query = `
            WITH date_range AS (
                -- Mencari rentang tanggal berdasarkan plot yang ada untuk SO ini
                -- Jika belum ada plot, ambil delivery_date sebagai patokan
                SELECT 
                    COALESCE(MIN(pop.date), (SELECT delivery_date FROM demands WHERE id = $1) - INTERVAL '7 days')::date as start_d,
                    COALESCE(MAX(pop.date), (SELECT delivery_date FROM demands WHERE id = $1) + INTERVAL '2 days')::date as end_d
                FROM production_order_plots pop
                WHERE pop.demand_id = $1
            ),
            target_items AS (
                -- Ambil semua item yang ada di SO ini (Master List)
                SELECT item_id, item_code, description, uom, total_qty, pcs
                FROM demand_items WHERE demand_id = $1
            )
            SELECT 
                ti.*,
                pop.date, 
                pop.shift, 
                pop.qty as plot_qty,
                d.so_number as ref_so,
                CASE 
                    WHEN pop.demand_id = $1 THEN 'CURRENT' 
                    ELSE 'OTHER' 
                END as plot_type
            FROM target_items ti
            -- Join ke plots berdasarkan item_id DAN rentang tanggal
            LEFT JOIN production_order_plots pop ON ti.item_id = pop.item_id 
                AND pop.date >= (SELECT start_d FROM date_range)
                AND pop.date <= (SELECT end_d FROM date_range)
            LEFT JOIN demands d ON pop.demand_id = d.id
            ORDER BY ti.item_code, pop.date ASC, pop.shift ASC;
        `;

        const result = await pool.query(query, [demand_id]);
        res.json(result.rows);
    } catch (err) {
        console.error("Matrix Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 4. Get Demand Items (Detail SKU)
exports.getDemandItems = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, item_code, description, uom, total_qty, pcs 
             FROM demand_items 
             WHERE demand_id = $1 
             ORDER BY item_code ASC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat item detail" });
    }
};