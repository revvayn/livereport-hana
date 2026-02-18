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
                const yyyy = currentDate.getFullYear();
                const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
                const dd = String(currentDate.getDate()).padStart(2, '0');
                const formattedDate = `${yyyy}-${mm}-${dd}`;

                await client.query(
                    `INSERT INTO production_order_plots ... VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        demand_id, item.item_id, route.operation_id, route.machine_id,
                        formattedDate, // Gunakan string manual, bukan ISOString
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
                -- Tentukan jendela waktu 10 hari di sekitar delivery date
                SELECT 
                    ((SELECT delivery_date FROM demands WHERE id = $1)::date - INTERVAL '7 days')::date as start_d,
                    ((SELECT delivery_date FROM demands WHERE id = $1)::date + INTERVAL '2 days')::date as end_d
            ),
            target_items AS (
                -- Ambil item yang memang milik SO ini
                SELECT item_id, item_code, description, uom, total_qty, pcs
                FROM demand_items WHERE demand_id = $1
            )
            SELECT 
        ti.*,
        pop.date, 
        pop.shift, 
        pop.qty as plot_qty,
        d.so_number as ref_so,
        -- Pastikan perbandingan ID ini akurat
        CASE 
            WHEN pop.demand_id = $1::integer THEN 'CURRENT' 
            ELSE 'OTHER' 
        END as plot_type
    FROM target_items ti
    LEFT JOIN production_order_plots pop ON ti.item_id = pop.item_id 
        AND pop.date BETWEEN (SELECT start_d FROM date_range) AND (SELECT end_d FROM date_range)
    LEFT JOIN demands d ON pop.demand_id = d.id
    ORDER BY ti.item_code ASC, pop.date ASC, pop.shift ASC;
`;
        const result = await pool.query(query, [demand_id]);
        res.json(result.rows);
    } catch (err) {
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

// Tambahkan fungsi baru ini di controller
exports.toggleManualPlot = async (req, res) => {
    const { demand_id, item_id, date, shift, qty, action } = req.body;

    try {
        if (action === 'ADD') {
            // 1. Cari routing secara manual jika tidak disertakan
            const routing = await pool.query(
                `SELECT operation_id, machine_id FROM item_routings WHERE item_id = $1 LIMIT 1`,
                [item_id]
            );
            
            const op_id = routing.rows.length > 0 ? routing.rows[0].operation_id : null;
            const mc_id = routing.rows.length > 0 ? routing.rows[0].machine_id : null;
        
            // 2. Gunakan UPSERT (Insert or Update)
            await pool.query(
                `INSERT INTO production_order_plots 
                (demand_id, item_id, operation_id, machine_id, date, shift, qty) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (demand_id, item_id, date, shift) 
                DO UPDATE SET qty = EXCLUDED.qty`,
                [
                    parseInt(demand_id), 
                    parseInt(item_id), 
                    op_id, 
                    mc_id, 
                    date, // Pastikan formatnya 'YYYY-MM-DD'
                    parseInt(shift), 
                    Math.round(qty)
                ]
            );
        } else {
            // Kita gunakan casting integer secara eksplisit untuk ID dan Shift
            const deleteResult = await pool.query(
                `DELETE FROM production_order_plots 
                 WHERE demand_id = $1::integer 
                 AND item_id = $2::integer 
                 AND TO_CHAR(date, 'YYYY-MM-DD') = $3 
                 AND shift = $4::integer`,
                [parseInt(demand_id), parseInt(item_id), date, parseInt(shift)]
            );

            if (deleteResult.rowCount === 0) {
                // INVESTIGASI: Jika gagal hapus, tarik data aslinya untuk dibandingkan
                const check = await pool.query(
                    `SELECT id, demand_id, item_id, TO_CHAR(date, 'YYYY-MM-DD') as dt, shift 
                     FROM production_order_plots 
                     WHERE demand_id = $1::integer AND item_id = $2::integer`,
                    [parseInt(demand_id), parseInt(item_id)]
                );

                console.log("--- DEBUG HAPUS ---");
                console.log("Input dari Frontend:", { demand_id, item_id, date, shift });
                console.log("Data di Database:", check.rows);

                return res.status(404).json({
                    error: `Gagal. Anda kirim Shift ${shift}, tapi di DB adanya Shift ${check.rows.length > 0 ? check.rows[0].shift : 'KOSONG'}`
                });
            }
        }
        res.json({ message: "Success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};