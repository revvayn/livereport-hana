// controllers/assemblyController.js
const pool = require('../db'); // Sesuaikan dengan koneksi database Anda

//=================================ASSEMBLY PANNEL===============================================
exports.getAllPannel = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM item_assembly_pannel ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPannel = async (req, res) => {
    try {
        const {assembly_code, description, warehouse} = req.body;
        const result = await pool.query(
            `INSERT INTO item_assembly_pannel ( assembly_code, description, warehouse) 
             VALUES ($1, $2, $3) RETURNING *`,
            [assembly_code, description, warehouse]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updatePannel = async (req, res) => {
    try {
        const { id } = req.params;
        const { assembly_code, description, warehouse } = req.body;
        await pool.query(
            'UPDATE item_assembly_pannel SET assembly_code=$1, description=$2, warehouse=$3 WHERE id=$4',
            [assembly_code, description, warehouse, id]
        );
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deletePannel = async (req, res) => {
    try {
        await pool.query('DELETE FROM item_assembly_pannel WHERE id = $1', [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//====================================ASSEMBLY CORE=============================================
exports.getAllCore = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM item_assembly_core ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.createCore = async (req, res) => {
    try {
        const {assembly_code, description, warehouse} = req.body;
        const result = await pool.query(
            `INSERT INTO item_assembly_core (assembly_code, description, warehouse) 
             VALUES ($1, $2, $3) RETURNING *`,
            [assembly_code, description, warehouse]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateCore = async (req, res) => {
    try {
        const { id } = req.params;
        const { assembly_code, description, warehouse } = req.body;
        await pool.query(
            'UPDATE item_assembly_core SET assembly_code=$1, description=$2, warehouse=$3 WHERE id=$4',
            [assembly_code, description, warehouse, id]
        );
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteCore = async (req, res) => {
    try {
        await pool.query('DELETE FROM item_assembly_core WHERE id = $1', [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//====================================ASSEMBLY GENERATE=============================================

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

        // 1. Ambil Delivery Date untuk patokan kalender
        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [demandId]);
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        // 2. Query untuk mendapatkan Routing, QTY (M3), dan PCS (Lembar)
        const querySelect = `
            SELECT 
                dif.demand_id, dif.demand_item_id, dif.item_id, dif.uom, 
                dif.total_qty, 
                di.pcs AS pcs_original, 
                dif.production_schedule AS finishing_schedule,
                ir.assembly_code_pannel, ap.description AS pannel_desc, ap.warehouse AS pannel_wh,
                ir.assembly_code_core, ac.description AS core_desc, ac.warehouse AS core_wh
            FROM demand_item_finishing dif
            INNER JOIN demand_items di ON dif.demand_item_id = di.id
            INNER JOIN item_routings ir ON di.item_code = ir.item_code
            LEFT JOIN item_assembly_pannel ap ON ir.assembly_code_pannel = ap.assembly_code
            LEFT JOIN item_assembly_core ac ON ir.assembly_code_core = ac.assembly_code
            WHERE dif.demand_id = $1
        `;

        const result = await client.query(querySelect, [demandId]);
        
        // 3. Bersihkan data lama sebelum re-generate
        await client.query(`DELETE FROM demand_item_assembly WHERE demand_id = $1`, [demandId]);

        for (const row of result.rows) {
            // Parsing jadwal finishing
            const finishingSchedule = typeof row.finishing_schedule === 'string' 
                ? JSON.parse(row.finishing_schedule) : (row.finishing_schedule || []);
            
            // Hitung slot assembly (QTY utuh)
            const assemblySlots = calculateAssemblySchedule(finishingSchedule);

            // --- DEFINISI finalCalendar (MEMPERBAIKI ERROR) ---
            const finalCalendar = [];
            for (let i = 14; i >= 0; i--) {
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

            const calendarJson = JSON.stringify(finalCalendar);
            const realQty = Number(row.total_qty || 0);    // Nilai M3 (misal 11.91)
            const realPcs = Number(row.pcs_original || 0); // Nilai PCS (misal 200)

            // 4. INSERT PANNEL (Gunakan realPcs untuk kolom PCS)
            if (row.assembly_code_pannel) {
                await client.query(
                    `INSERT INTO demand_item_assembly 
                    (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        row.demand_id, row.demand_item_id, row.item_id, 
                        row.assembly_code_pannel, `[PANNEL] ${row.pannel_desc}`, 
                        row.uom, realQty, realPcs, calendarJson, row.pannel_wh || 'WIPA'
                    ]
                );
            }

            // 5. INSERT CORE (Gunakan realPcs untuk kolom PCS)
            if (row.assembly_code_core) {
                await client.query(
                    `INSERT INTO demand_item_assembly 
                    (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        row.demand_id, row.demand_item_id, row.item_id, 
                        row.assembly_code_core, `[CORE] ${row.core_desc}`, 
                        row.uom, realQty, realPcs, calendarJson, row.core_wh || 'WIPA'
                    ]
                );
            }
        }

        await client.query('UPDATE demands SET is_assembly_generated = true WHERE id = $1', [demandId]);
        await client.query('COMMIT');
        res.json({ message: "Generate Berhasil" });
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
            'SELECT * FROM demand_item_assembly WHERE demand_id = $1 ORDER BY id ASC', [demandId]
        );
        const rows = result.rows.map(row => ({
            ...row,
            calendar: typeof row.production_schedule === 'string' ? JSON.parse(row.production_schedule) : row.production_schedule || []
        }));
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAssemblySchedule = async (req, res) => {
    const { items } = req.body;
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
        res.json({ message: "Update Berhasil" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};