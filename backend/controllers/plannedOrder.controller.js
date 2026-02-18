const pool = require("../db");

// 1. Get All Orders (Demands)
exports.getAllOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id as demand_id, 
                d.reference_no, 
                d.delivery_date,
                d.has_schedule,
                c.name as customer_name,
                (SELECT COUNT(*) FROM demand_items WHERE demand_id = d.id) as total_items
            FROM demands d
            LEFT JOIN customers c ON d.customer_id = c.id
            ORDER BY d.id DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Backward Scheduling Logic
exports.autoGenerateSOSchedule = async (req, res) => {
    const { demand_id, delivery_date } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Fetch items within the Sales Order (SO)
        const itemsRes = await client.query(
            `SELECT di.item_id, di.pcs, i.item_code 
             FROM demand_items di 
             JOIN items i ON di.item_id = i.id 
             WHERE di.demand_id = $1`,
            [demand_id]
        );

        if (itemsRes.rows.length === 0) {
            return res.status(400).json({ error: "SO ini tidak memiliki item." });
        }

        let skippedItems = [];
        // Clear existing plots for this demand to avoid duplicates
        await client.query(`DELETE FROM production_order_plots WHERE demand_id = $1`, [demand_id]);

        for (const item of itemsRes.rows) {
            // Fetch Routing - Critical: If this is empty, no plots are created
            const routingRes = await client.query(
                `SELECT operation_id, machine_id, cycle_time_min, "sequence" 
                 FROM item_routings 
                 WHERE item_id = $1 
                 ORDER BY "sequence" DESC`,
                [item.item_id]
            );

            if (routingRes.rows.length === 0) {
                skippedItems.push(item.item_code);
                continue;
            }

            let currentScheduleDate = new Date(delivery_date);
            let currentShift = 3;

            for (const route of routingRes.rows) {
                // Determine how many shifts are needed (1 shift = 1 plot in this simplified logic)
                const shiftsNeeded = Math.ceil(parseFloat(route.cycle_time_min) || 1);

                for (let i = 0; i < shiftsNeeded; i++) {
                    await client.query(
                        `INSERT INTO production_order_plots 
                        (demand_id, item_id, operation_id, machine_id, date, shift, qty) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            demand_id, item.item_id, route.operation_id, route.machine_id,
                            currentScheduleDate.toISOString().split('T')[0],
                            currentShift, item.pcs
                        ]
                    );

                    // Move backward in time
                    currentShift--;
                    if (currentShift < 1) {
                        currentShift = 3;
                        currentScheduleDate.setDate(currentScheduleDate.getDate() - 1);
                    }
                }
            }
        }

        const totalGenerated = itemsRes.rows.length - skippedItems.length;
        if (totalGenerated > 0) {
            await client.query(`UPDATE demands SET has_schedule = true WHERE id = $1`, [demand_id]);
        }

        await client.query('COMMIT');
        res.json({ 
            message: "Generate selesai.",
            skipped: skippedItems 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// 3. Fetch Plots for UI
exports.getScheduleByDemand = async (req, res) => {
    try {
        const { demand_id } = req.params;

        if (!demand_id || demand_id === 'undefined') {
            return res.status(400).json({ error: "Demand ID diperlukan" });
        }

        // Query dengan JOIN ke demand_items untuk mendapatkan detail teknis
        const query = `
            SELECT 
                pop.id,
                pop.date,
                pop.shift,
                pop.qty,
                i.item_code, 
                di.description,
                di.uom,
                di.total_qty,
                di.pcs,
                op.operation_name, 
                COALESCE(m.machine_name, 'No Machine') AS machine_name
            FROM production_order_plots pop
            INNER JOIN items i ON pop.item_id = i.id
            INNER JOIN operations op ON pop.operation_id = op.id
            LEFT JOIN machines m ON pop.machine_id = m.id
            LEFT JOIN demand_items di ON pop.demand_id = di.demand_id AND pop.item_id = di.item_id
            WHERE pop.demand_id = $1
            ORDER BY i.item_code ASC, pop.date ASC, pop.shift ASC;
        `;
        
        const result = await pool.query(query, [demand_id]);
        res.json(result.rows);
    } catch (err) {
        console.error("DATABASE ERROR:", err.message);
        res.status(500).json({ error: "Gagal memuat data: " + err.message });
    }
};