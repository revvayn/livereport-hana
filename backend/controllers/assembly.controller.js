const pool = require('../db');
const xlsx = require('xlsx');

/* ==================== HELPER FUNCTIONS ==================== */

/**
 * Mengambil nilai EWH dan Yield secara dinamis dari tabel work_centers
 * @param {string} wcName - Nama Work Center (e.g., 'Assembly Pannel')
 */
const getWorkCenterParams = async (wcName) => {
    try {
        const res = await pool.query(
            "SELECT ewh, yield FROM work_centers WHERE work_center_name = $1 LIMIT 1",
            [wcName]
        );
        if (res.rows.length > 0) {
            return {
                ewh: parseInt(res.rows[0].ewh) || 20160,
                // Mengubah persen (98.00) menjadi faktor desimal (0.98)
                yieldFactor: parseFloat(res.rows[0].yield) / 100 || 1.0
            };
        }
        return { ewh: 20160, yieldFactor: 1.0 };
    } catch (err) {
        console.error(`Error fetching params for ${wcName}:`, err);
        return { ewh: 20160, yieldFactor: 1.0 };
    }
};

/**
 * Menghitung kapasitas per shift dengan mempertimbangkan Yield
 * Rumus: (EWH / CycleTime) * YieldFactor
 */
const calculateCapacity = (cycleTime, ewhSeconds, yieldFactor) => {
    const ct = parseInt(cycleTime);
    if (!ct || ct <= 0) return 0;
    
    const baseCapacity = ewhSeconds / ct;
    // Kapasitas yang dihasilkan adalah barang bagus saja (yield)
    return Math.floor(baseCapacity * yieldFactor);
};

/* ==================== ASSEMBLY PANNEL CONTROLLERS ==================== */

exports.getAllPannel = async (req, res) => {
    const { search } = req.query;
    try {
        let query = "SELECT * FROM item_assembly_pannel";
        let values = [];
        if (search) {
            query += " WHERE assembly_code ILIKE $1 OR description ILIKE $1";
            values = [`%${search}%`];
        }
        query += " ORDER BY id DESC";
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil data assembly pannel" });
    }
};

exports.createPannel = async (req, res) => {
    const { assembly_code, description, warehouse, cycle_time } = req.body;
    if (!assembly_code || !description) return res.status(400).json({ error: "Data tidak lengkap" });

    try {
        const { ewh, yieldFactor } = await getWorkCenterParams("Assembly Pannel");
        const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);

        const result = await pool.query(
            `INSERT INTO item_assembly_pannel (assembly_code, description, warehouse, cycle_time, capacity_per_shift) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [assembly_code.toUpperCase(), description, warehouse || 'PFIN', cycle_time || 0, capacity]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal membuat data pannel" });
    }
};

exports.updatePannel = async (req, res) => {
    const { id } = req.params;
    const { assembly_code, description, warehouse, cycle_time } = req.body;
    try {
        const { ewh, yieldFactor } = await getWorkCenterParams("Assembly Pannel");
        const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);

        const result = await pool.query(
            `UPDATE item_assembly_pannel 
             SET assembly_code=$1, description=$2, warehouse=$3, cycle_time=$4, capacity_per_shift=$5 
             WHERE id=$6 RETURNING *`,
            [assembly_code.toUpperCase(), description, warehouse, cycle_time || 0, capacity, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal memperbarui data pannel" });
    }
};

exports.importExcelPannel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const { ewh, yieldFactor } = await getWorkCenterParams("Assembly Pannel");

        await pool.query("BEGIN");
        for (const row of data) {
            const { assembly_code, description, warehouse, cycle_time } = row;
            if (!assembly_code) continue;

            const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
            const query = `
                INSERT INTO item_assembly_pannel (assembly_code, description, warehouse, cycle_time, capacity_per_shift)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (assembly_code) DO UPDATE SET 
                  description = EXCLUDED.description,
                  warehouse = EXCLUDED.warehouse,
                  cycle_time = EXCLUDED.cycle_time,
                  capacity_per_shift = EXCLUDED.capacity_per_shift`;
            
            await pool.query(query, [
                assembly_code.toString().toUpperCase(),
                description || "",
                warehouse || 'PFIN',
                cycle_time || 0,
                capacity
            ]);
        }
        await pool.query("COMMIT");
        res.json({ message: "Import Excel Pannel berhasil dengan faktor Yield" });
    } catch (err) {
        await pool.query("ROLLBACK");
        res.status(500).json({ error: "Gagal import excel pannel: " + err.message });
    }
};

/* ==================== ASSEMBLY CORE CONTROLLERS ==================== */

exports.getAllCore = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM item_assembly_core ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCore = async (req, res) => {
    const { assembly_code, description, warehouse, cycle_time } = req.body;
    try {
        const { ewh, yieldFactor } = await getWorkCenterParams("Assembly Core");
        const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);

        const result = await pool.query(
            `INSERT INTO item_assembly_core (assembly_code, description, warehouse, cycle_time, capacity_per_shift) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [assembly_code.toUpperCase(), description, warehouse || 'WIPA', cycle_time || 0, capacity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateCore = async (req, res) => {
    const { id } = req.params;
    const { assembly_code, description, warehouse, cycle_time } = req.body;
    try {
        const { ewh, yieldFactor } = await getWorkCenterParams("Assembly Core");
        const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);

        await pool.query(
            `UPDATE item_assembly_core 
             SET assembly_code=$1, description=$2, warehouse=$3, cycle_time=$4, capacity_per_shift=$5, updated_at=NOW() 
             WHERE id=$6`,
            [assembly_code.toUpperCase(), description, warehouse, cycle_time || 0, capacity, id]
        );
        res.json({ message: "Updated core successfully with Yield compensation" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.importExcelCore = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const { ewh, yieldFactor } = await getWorkCenterParams("Assembly Core");

        await pool.query("BEGIN");
        for (const row of data) {
            const { assembly_code, description, warehouse, cycle_time } = row;
            if (!assembly_code) continue;

            const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
            const query = `
                INSERT INTO item_assembly_core (assembly_code, description, warehouse, cycle_time, capacity_per_shift)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (assembly_code) DO UPDATE SET 
                  description = EXCLUDED.description,
                  warehouse = EXCLUDED.warehouse,
                  cycle_time = EXCLUDED.cycle_time,
                  capacity_per_shift = EXCLUDED.capacity_per_shift,
                  updated_at = NOW()`;
            
            await pool.query(query, [
                assembly_code.toString().toUpperCase(),
                description || "",
                warehouse || 'WIPA',
                cycle_time || 0,
                capacity
            ]);
        }
        await pool.query("COMMIT");
        res.json({ message: "Import Excel Core berhasil dengan faktor Yield" });
    } catch (err) {
        await pool.query("ROLLBACK");
        res.status(500).json({ error: "Gagal import excel core: " + err.message });
    }
};

// Generic delete functions
exports.deletePannel = async (req, res) => {
    try {
        await pool.query("DELETE FROM item_assembly_pannel WHERE id=$1", [req.params.id]);
        res.json({ message: "Data pannel terhapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus data pannel" });
    }
};

exports.deleteCore = async (req, res) => {
    try {
        await pool.query('DELETE FROM item_assembly_core WHERE id = $1', [req.params.id]);
        res.json({ message: "Data core terhapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//====================================ASSEMBLY GENERATE=============================================

const calculateAssemblySchedule = (referenceSchedule, capacity, holidays = [], leadTime = 2) => {
    if (!referenceSchedule || !Array.isArray(referenceSchedule)) return [];

    const capPerShift = Number(capacity) || 100;
    const isHoliday = (dateStr) => {
        const d = new Date(dateStr);
        if (d.getDay() === 0) return true; // Minggu libur
        return holidays.includes(dateStr);
    };

    // 1. Hitung TOTAL QTY yang dibutuhkan dari referensi
    let totalQtyNeeded = 0;
    const sortedRef = [...referenceSchedule].sort((a, b) => a.date.localeCompare(b.date));
    
    // Cari titik awal (Shift paling pertama yang ada isinya di referensi)
    let refStartDay = "";
    let refStartShift = -1;

    for (const day of sortedRef) {
        for (let s = 1; s <= 3; s++) {
            const q = Number(day.shifts[`shift${s}`]?.qty || 0);
            if (q > 0) {
                totalQtyNeeded += q;
                if (!refStartDay) {
                    refStartDay = day.date;
                    refStartShift = s;
                }
            }
        }
    }

    if (totalQtyNeeded <= 0 || !refStartDay) return [];

    // 2. Tentukan titik awal produksi (Mundur sesuai Lead Time dari refStartShift)
    let currentDay = new Date(refStartDay);
    let currentShift = refStartShift;

    for (let i = 0; i < leadTime; i++) {
        currentShift--;
        if (currentShift < 1) {
            currentShift = 3;
            currentDay.setDate(currentDay.getDate() - 1);
            while (isHoliday(currentDay.toISOString().split('T')[0])) {
                currentDay.setDate(currentDay.getDate() - 1);
            }
        }
    }

    // 3. Plotting Qty secara PADAT (Fill to Capacity) mundur ke belakang
    const assemblyDataMap = {};
    let remainingQty = totalQtyNeeded;

    while (remainingQty > 0) {
        let dateKey = currentDay.toISOString().split('T')[0];

        // Jika hari libur, mundur ke hari sebelumnya
        if (isHoliday(dateKey)) {
            currentDay.setDate(currentDay.getDate() - 1);
            continue;
        }

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

        // Isi maksimal sesuai kapasitas shift
        const canTake = capPerShift;
        const take = Math.min(remainingQty, canTake);

        assemblyDataMap[dateKey].shifts[`shift${currentShift}`].qty = take;
        assemblyDataMap[dateKey].shifts[`shift${currentShift}`].active = true;
        remainingQty -= take;

        // Mundur ke shift sebelumnya
        currentShift--;
        if (currentShift < 1) {
            currentShift = 3;
            currentDay.setDate(currentDay.getDate() - 1);
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

        // 1. Ambil List Hari Libur
        const holidayRes = await client.query(`SELECT holiday_date FROM public_holidays`);
        const holidays = holidayRes.rows.map(h => new Date(h.holiday_date).toISOString().split('T')[0]);

        // 2. Ambil Lead Time (Gunakan default jika tidak ditemukan)
        const wcRes = await client.query("SELECT work_center_name, lead_time FROM work_centers");
        const getLT = (name) => {
            const found = wcRes.rows.find(w => w.work_center_name?.toLowerCase().includes(name.toLowerCase()));
            return found ? parseInt(found.lead_time) : 2;
        };
        const pannelLT = getLT('pannel');
        const coreLT = getLT('core');

        // 3. Ambil Data Dasar
        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [demandId]);
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        const result = await client.query(`
            SELECT 
                dif.demand_id, dif.demand_item_id, dif.production_schedule AS finishing_schedule, 
                dif.uom, dif.total_qty, di.item_code, di.pcs AS pcs_original, di.item_id,
                ir.assembly_code_pannel, ap.description AS pannel_desc, ap.capacity_per_shift AS pannel_cap,
                ir.assembly_code_core, ac.description AS core_desc, ac.capacity_per_shift AS core_cap
            FROM demand_item_finishing dif
            INNER JOIN demand_items di ON dif.demand_item_id = di.id
            LEFT JOIN item_routings ir ON UPPER(di.item_code) = UPPER(ir.item_code)
            LEFT JOIN item_assembly_pannel ap ON ir.assembly_code_pannel = ap.assembly_code
            LEFT JOIN item_assembly_core ac ON ir.assembly_code_core = ac.assembly_code
            WHERE dif.demand_id = $1
        `, [demandId]);

        await client.query(`DELETE FROM demand_item_assembly WHERE demand_id = $1`, [demandId]);

        for (const row of result.rows) {
            const finishingSchedule = typeof row.finishing_schedule === 'string' 
                ? JSON.parse(row.finishing_schedule) : (row.finishing_schedule || []);

            // --- PROSES PANNEL ---
            let pannelFinalSchedule = [];
            if (row.assembly_code_pannel) {
                const pannelSlots = calculateAssemblySchedule(finishingSchedule, row.pannel_cap, holidays, pannelLT);
                pannelFinalSchedule = createCalendarArray(deliveryDate, pannelSlots);
                
                await insertToAssembly(client, row, row.assembly_code_pannel, `[PANNEL] ${row.pannel_desc || ''}`, pannelFinalSchedule);
            }

            // --- PROSES CORE ---
            if (row.assembly_code_core) {
                // CORE merujuk ke PANNEL (jika ada), jika tidak ada baru merujuk ke FINISHING
                const refForCore = pannelFinalSchedule.length > 0 ? pannelFinalSchedule : finishingSchedule;
                const coreSlots = calculateAssemblySchedule(refForCore, row.core_cap, holidays, coreLT);
                const coreFinalSchedule = createCalendarArray(deliveryDate, coreSlots);
                
                await insertToAssembly(client, row, row.assembly_code_core, `[CORE] ${row.core_desc || ''}`, coreFinalSchedule);
            }
        }

        await client.query('UPDATE demands SET is_assembly_generated = true WHERE id = $1', [demandId]);
        await client.query('COMMIT');
        res.json({ message: "Generate Assembly Berhasil" });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// Helper Insert untuk menjaga kerapihan
const insertToAssembly = async (client, row, code, desc, calendar, wh) => {
    await client.query(
        `INSERT INTO demand_item_assembly 
        (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [row.demand_id, row.demand_item_id, row.item_id, code, desc, row.uom, row.total_qty, row.pcs_original, JSON.stringify(calendar), wh]
    );
};

// Helper Kalender agar konsisten 21 hari (H-20 s/d Hari H) seperti Finishing
const createCalendarArray = (deliveryDate, slots) => {
    const calendar = [];
    for (let i = 20; i >= 0; i--) {
        const d = new Date(deliveryDate);
        d.setDate(deliveryDate.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const found = slots.find(f => f.date === dateStr);
        
        calendar.push({
            date: dateStr,
            shifts: found ? found.shifts : {
                shift1: { qty: 0, active: false, type: "assembly" },
                shift2: { qty: 0, active: false, type: "assembly" },
                shift3: { qty: 0, active: false, type: "assembly" }
            }
        });
    }
    return calendar.sort((a, b) => a.date.localeCompare(b.date));
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