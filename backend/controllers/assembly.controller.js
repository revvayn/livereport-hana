// controllers/assemblyController.js
const pool = require('../db'); // Sesuaikan dengan koneksi database Anda

const calculateAssemblySchedule = (finishingSchedule) => {
    if (!finishingSchedule || !Array.isArray(finishingSchedule)) return [];

    let totalQtyToProcess = 0;
    finishingSchedule.forEach(day => {
        const shifts = day.shifts || {};
        totalQtyToProcess += (shifts.shift1?.qty || 0) + (shifts.shift2?.qty || 0) + (shifts.shift3?.qty || 0);
    });

    if (totalQtyToProcess === 0) return [];

    const activeDays = finishingSchedule
        .filter(d => {
            const s = d.shifts || {};
            return ((s.shift1?.qty || 0) + (s.shift2?.qty || 0) + (s.shift3?.qty || 0)) > 0;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (activeDays.length === 0) return [];

    const firstFinishingDateStr = activeDays[0].date.split('T')[0];
    const [year, month, day] = firstFinishingDateStr.split("-").map(Number);

    let firstShift = 1;
    for (let s = 1; s <= 3; s++) {
        if ((activeDays[0].shifts[`shift${s}`]?.qty || 0) > 0) {
            firstShift = s;
            break;
        }
    }

    let currentDayObj = new Date(year, month - 1, day);
    let currentShift = firstShift - 1;
    if (currentShift < 1) {
        currentDayObj.setDate(currentDayObj.getDate() - 1);
        currentShift = 3;
    }

    const assemblyDataMap = {};
    const capacityPerShift = 100; // Statis 100
    let remainingQty = totalQtyToProcess;

    while (remainingQty > 0) {
        const y = currentDayObj.getFullYear();
        const m = String(currentDayObj.getMonth() + 1).padStart(2, "0");
        const d = String(currentDayObj.getDate()).padStart(2, "0");
        const dateKey = `${y}-${m}-${d}`;

        if (!assemblyDataMap[dateKey]) {
            assemblyDataMap[dateKey] = {
                date: dateKey,
                shifts: {
                    shift1: { qty: 0, active: false, type: "assembly" },
                    shift2: { qty: 0, active: false, type: "assembly" },
                    shift3: { qty: 0, active: false, type: "assembly" }
                }
            };
        }

        const take = Math.min(remainingQty, capacityPerShift);
        assemblyDataMap[dateKey].shifts[`shift${currentShift}`].qty = take;
        assemblyDataMap[dateKey].shifts[`shift${currentShift}`].active = true;

        remainingQty -= take;

        currentShift--;
        if (currentShift < 1) {
            currentDayObj.setDate(currentDayObj.getDate() - 1);
            currentShift = 3;
        }
    }

    return Object.values(assemblyDataMap);
};

exports.getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM item_assembly ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getByFinishingId = async (req, res) => {
    try {
        const { finishingId } = req.params;
        const result = await pool.query(
            'SELECT * FROM item_assembly WHERE finishing_id = $1 ORDER BY id ASC',
            [finishingId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { finishing_id, assembly_code, description, warehouse, item_code } = req.body;
        const result = await pool.query(
            `INSERT INTO item_assembly (finishing_id, assembly_code, description, warehouse, item_code) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [finishing_id, assembly_code, description, warehouse, item_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { assembly_code, description, warehouse } = req.body;
        await pool.query(
            'UPDATE item_assembly SET assembly_code=$1, description=$2, warehouse=$3 WHERE id=$4',
            [assembly_code, description, warehouse, id]
        );
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.query('DELETE FROM item_assembly WHERE id = $1', [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFinishingItems = async (req, res) => {
    try {
        const { warehouse } = req.query;
        let query = 'SELECT * FROM item_finishing';
        let params = [];

        if (warehouse) {
            query += ' WHERE UPPER(warehouse) = $1';
            params.push(warehouse.toUpperCase());
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        // Jika ini error, maka frontend akan menampilkan "Gagal mengambil data"
        res.status(500).json({ error: err.message });
    }
};

exports.generateAssembly = async (req, res) => {
    const { demandId } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [demandId]);
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        const querySelect = `
            SELECT 
                dif.demand_id,
                dif.demand_item_id,
                dif.item_id,
                dif.uom,
                dif.total_qty,
                dif.production_schedule AS finishing_schedule,
                ia.assembly_code,
                ia.description AS assembly_desc,
                ia.warehouse AS master_warehouse
            FROM demand_item_finishing dif
            JOIN item_finishing ifin ON dif.item_code = ifin.finishing_code
            JOIN item_assembly ia ON ifin.id = ia.finishing_id
            WHERE dif.demand_id = $1
        `;

        const result = await client.query(querySelect, [demandId]);

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: "Data Finishing belum tersedia."
            });
        }

        await client.query(`DELETE FROM demand_item_assembly WHERE demand_id = $1`, [demandId]);

        for (const row of result.rows) {
            const finishingSchedule = typeof row.finishing_schedule === 'string'
                ? JSON.parse(row.finishing_schedule) : (row.finishing_schedule || []);

            const assemblySlots = calculateAssemblySchedule(finishingSchedule);

            const finalCalendar = [];
            const daysToDisplay = 15;

            for (let i = daysToDisplay - 1; i >= 0; i--) {
                const d = new Date(deliveryDate);
                d.setDate(deliveryDate.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const found = assemblySlots.find(f => f.date === dateStr);

                finalCalendar.push({
                    date: dateStr,
                    shifts: found ? found.shifts : {
                        shift1: { qty: 0, active: false, type: "assembly" },
                        shift2: { qty: 0, active: false, type: "assembly" },
                        shift3: { qty: 0, active: false, type: "assembly" }
                    }
                });
            }

            await client.query(
                `INSERT INTO demand_item_assembly 
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    row.demand_id,
                    row.demand_item_id,
                    row.item_id,
                    row.assembly_code,
                    row.assembly_desc,
                    row.uom,
                    row.total_qty,
                    100, // Simpan pcs statis 100
                    JSON.stringify(finalCalendar),
                    row.master_warehouse || 'WIPA'
                ]
            );
        }

        await client.query('UPDATE demands SET is_assembly_generated = true WHERE id = $1', [demandId]);
        await client.query('COMMIT');

        res.json({ message: "Generate Assembly Berhasil (Kapasitas Statis 100/Shift)" });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.getItemsByDemandId = async (req, res) => {
    try {
        const { demandId } = req.params;
        const result = await pool.query(
            'SELECT * FROM demand_item_assembly WHERE demand_id = $1 ORDER BY id ASC',
            [demandId]
        );

        const rows = result.rows.map(row => ({
            ...row,
            calendar: typeof row.production_schedule === 'string'
                ? JSON.parse(row.production_schedule)
                : row.production_schedule || []
        }));

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAssemblySchedule = async (req, res) => {
    const { items } = req.body; // Array of item assembly
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of items) {
            await client.query(
                `UPDATE demand_item_assembly SET production_schedule=$1 WHERE id=$2`,
                [JSON.stringify(item.calendar), item.id]
            );
        }
        await client.query('COMMIT');
        res.json({ message: "Update Jadwal Assembly Berhasil" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};