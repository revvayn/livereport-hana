const pool = require('../db');
const xlsx = require('xlsx');

// Logika Kapasitas: 7 jam * 80% efisiensi * 3600 detik = 20,160 detik
const calculateCapacity = (cycleTime) => {
    const ct = parseInt(cycleTime);
    if (!ct || ct <= 0) return 0;
    const ewhSeconds = 7 * 0.8 * 3600; // 20,160 detik
    return Math.floor(ewhSeconds / ct);
};

// GET ALL
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

// CREATE
exports.createPannel = async (req, res) => {
    const { assembly_code, description, warehouse, cycle_time } = req.body;
    if (!assembly_code || !description) return res.status(400).json({ error: "Data tidak lengkap" });

    try {
        const capacity = calculateCapacity(cycle_time);
        const result = await pool.query(
            `INSERT INTO item_assembly_pannel (assembly_code, description, warehouse, cycle_time, capacity_per_shift) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [assembly_code.toUpperCase(), description, warehouse || 'PFIN', cycle_time || 0, capacity]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal membuat data" });
    }
};

// UPDATE
exports.updatePannel = async (req, res) => {
    const { id } = req.params;
    const { assembly_code, description, warehouse, cycle_time } = req.body;
    try {
        const capacity = calculateCapacity(cycle_time);
        const result = await pool.query(
            `UPDATE item_assembly_pannel 
       SET assembly_code=$1, description=$2, warehouse=$3, cycle_time=$4, capacity_per_shift=$5 
       WHERE id=$6 RETURNING *`,
            [assembly_code.toUpperCase(), description, warehouse, cycle_time || 0, capacity, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal memperbarui data" });
    }
};

// DELETE
exports.deletePannel = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM item_assembly_pannel WHERE id=$1", [id]);
        res.json({ message: "Data terhapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus data" });
    }
};

// IMPORT EXCEL
exports.importExcelPannel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        await pool.query("BEGIN");
        for (const row of data) {
            // Pastikan header di Excel Anda: assembly_code, description, warehouse, cycle_time
            const { assembly_code, description, warehouse, cycle_time } = row;
            if (!assembly_code) continue;

            const capacity = calculateCapacity(cycle_time);
            const query = `
        INSERT INTO item_assembly_pannel (assembly_code, description, warehouse, cycle_time, capacity_per_shift)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (assembly_code) 
        DO UPDATE SET 
          description = EXCLUDED.description,
          warehouse = EXCLUDED.warehouse,
          cycle_time = EXCLUDED.cycle_time,
          capacity_per_shift = EXCLUDED.capacity_per_shift
      `;
            await pool.query(query, [
                assembly_code.toString().toUpperCase(),
                description || "",
                warehouse || 'PFIN',
                cycle_time || 0,
                capacity // Gunakan variabel 'capacity' hasil perhitungan
            ]);
        }
        await pool.query("COMMIT");
        res.json({ message: "Import Excel berhasil" });
    } catch (err) {
        await pool.query("ROLLBACK");
        res.status(500).json({ error: "Gagal import excel: " + err.message });
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
        const { assembly_code, description, warehouse, cycle_time } = req.body;

        // Kalkulasi Capacity (Asumsi 7 jam shift, 80% efisiensi)
        // 7 jam * 3600 detik * 0.8 = 20160 detik efektif
        const cycleTimeNum = parseInt(cycle_time) || 0;
        const capacity = cycleTimeNum > 0 ? Math.floor(20160 / cycleTimeNum) : 0;

        const result = await pool.query(
            `INSERT INTO item_assembly_core (assembly_code, description, warehouse, cycle_time, capacity_per_shift) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [assembly_code, description, warehouse || 'WIPA', cycleTimeNum, capacity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateCore = async (req, res) => {
    try {
        const { id } = req.params;
        const { assembly_code, description, warehouse, cycle_time } = req.body;

        const cycleTimeNum = parseInt(cycle_time) || 0;
        const capacity = cycleTimeNum > 0 ? Math.floor(20160 / cycleTimeNum) : 0;

        await pool.query(
            `UPDATE item_assembly_core 
             SET assembly_code=$1, description=$2, warehouse=$3, cycle_time=$4, capacity_per_shift=$5, updated_at=NOW() 
             WHERE id=$6`,
            [assembly_code, description, warehouse, cycleTimeNum, capacity, id]
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

exports.importExcelCore = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        await pool.query("BEGIN");
        for (const row of data) {
            // Header di Excel: assembly_code, description, warehouse, cycle_time
            const { assembly_code, description, warehouse, cycle_time } = row;
            if (!assembly_code) continue;

            const capacity = calculateCapacity(cycle_time);
            const query = `
                INSERT INTO item_assembly_core (assembly_code, description, warehouse, cycle_time, capacity_per_shift)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (assembly_code) 
                DO UPDATE SET 
                  description = EXCLUDED.description,
                  warehouse = EXCLUDED.warehouse,
                  cycle_time = EXCLUDED.cycle_time,
                  capacity_per_shift = EXCLUDED.capacity_per_shift,
                  updated_at = NOW()
            `;
            await pool.query(query, [
                assembly_code.toString().toUpperCase(),
                description || "",
                warehouse || 'WIPA',
                cycle_time || 0,
                capacity
            ]);
        }
        await pool.query("COMMIT");
        res.json({ message: "Import Excel Core berhasil" });
    } catch (err) {
        await pool.query("ROLLBACK");
        res.status(500).json({ error: "Gagal import excel core: " + err.message });
    }
};

//====================================ASSEMBLY GENERATE=============================================

const calculateAssemblySchedule = (referenceSchedule, capacity, holidays = []) => {
    if (!referenceSchedule || !Array.isArray(referenceSchedule)) return [];

    // 1. Hitung total Qty dari jadwal referensi (bisa finishing atau pannel)
    let totalQtyToProcess = 0;
    referenceSchedule.forEach(day => {
        const shifts = day.shifts || {};
        totalQtyToProcess += (shifts.shift1?.qty || 0) + (shifts.shift2?.qty || 0) + (shifts.shift3?.qty || 0);
    });

    if (totalQtyToProcess === 0) return [];

    // 2. Cari titik awal jadwal referensi
    const activeDays = referenceSchedule
        .filter(d => {
            const s = d.shifts || {};
            return ((s.shift1?.qty || 0) + (s.shift2?.qty || 0) + (s.shift3?.qty || 0)) > 0;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (activeDays.length === 0) return [];

    const firstRefDateStr = activeDays[0].date.split('T')[0];
    let [year, month, day] = firstRefDateStr.split("-").map(Number);

    let startShift = 1;
    for (let s = 1; s <= 3; s++) {
        if ((activeDays[0].shifts[`shift${s}`]?.qty || 0) > 0) {
            startShift = s;
            break;
        }
    }
    // 3. Helper Cek Libur yang lebih aman terhadap Timezone
    const isHoliday = (dateObj) => {
        // Clone agar tidak merusak objek asli
        const tempDate = new Date(dateObj.getTime());
        const dayOfWeek = tempDate.getDay();

        if (dayOfWeek === 0) return true; // Minggu (0) PASTI Libur

        // Format YYYY-MM-DD untuk cek di array holidays
        const y = tempDate.getFullYear();
        const m = String(tempDate.getMonth() + 1).padStart(2, "0");
        const d = String(tempDate.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;

        return holidays.includes(dateStr);
    };

    // 4. Inisialisasi Titik Mundur (PENTING: Gunakan jam 00:00:00 agar getDay() akurat)
    let currentDayObj = new Date(year, month - 1, day, 0, 0, 0);
    let currentShift = startShift;

    for (let i = 0; i < 3; i++) {
        currentShift--;
        if (currentShift < 1) {
            currentShift = 3;
            currentDayObj.setDate(currentDayObj.getDate() - 1);

            // Jika hari hasil mundur adalah hari libur, terus mundur ke hari kerja sebelumnya
            while (isHoliday(currentDayObj)) {
                currentDayObj.setDate(currentDayObj.getDate() - 1);
            }
        }
    }

    // 5. Plotting Produksi Assembly
    const assemblyDataMap = {};
    const capacityPerShift = Number(capacity) > 0 ? Number(capacity) : 100;
    let remainingQty = totalQtyToProcess;

    while (remainingQty > 0) {
        // Validasi Hari Libur sebelum mengisi Qty
        while (isHoliday(currentDayObj)) {
            currentDayObj.setDate(currentDayObj.getDate() - 1);
        }

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

        // Mundur ke shift sebelumnya untuk sisa Qty
        currentShift--;
        if (currentShift < 1) {
            currentShift = 3;
            currentDayObj.setDate(currentDayObj.getDate() - 1);
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
        const holidays = holidayRes.rows.map(h => h.holiday_date.toISOString().split('T')[0]);

        // 2. Ambil Info Demand (Delivery Date)
        const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [demandId]);
        if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
        const deliveryDate = new Date(demandRes.rows[0].delivery_date);

        // 3. Ambil Data Finishing sebagai referensi awal dan join ke routing
        const querySelect = `
            SELECT 
                dif.demand_id, dif.demand_item_id, dif.item_id, dif.uom, 
                dif.total_qty, 
                di.pcs AS pcs_original, 
                dif.production_schedule AS finishing_schedule,
                ir.assembly_code_pannel, ap.description AS pannel_desc, ap.warehouse AS pannel_wh, 
                ap.capacity_per_shift AS pannel_cap,
                ir.assembly_code_core, ac.description AS core_desc, ac.warehouse AS core_wh,
                ac.capacity_per_shift AS core_cap
            FROM demand_item_finishing dif
            INNER JOIN demand_items di ON dif.demand_item_id = di.id
            INNER JOIN item_routings ir ON di.item_code = ir.item_code
            LEFT JOIN item_assembly_pannel ap ON ir.assembly_code_pannel = ap.assembly_code
            LEFT JOIN item_assembly_core ac ON ir.assembly_code_core = ac.assembly_code
            WHERE dif.demand_id = $1
        `;

        const result = await client.query(querySelect, [demandId]);

        // Bersihkan data lama sebelum re-generate
        await client.query(`DELETE FROM demand_item_assembly WHERE demand_id = $1`, [demandId]);

        for (const row of result.rows) {
            const finishingSchedule = typeof row.finishing_schedule === 'string'
                ? JSON.parse(row.finishing_schedule) : (row.finishing_schedule || []);

            const realQty = Number(row.total_qty || 0);
            const realPcs = Number(row.pcs_original || 0);

            // Pointer referensi: Core akan mengikuti Pannel, Pannel mengikuti Finishing
            let lastScheduleRef = finishingSchedule;

            // --- A. PROSES PANNEL ---
            if (row.assembly_code_pannel) {
                const pannelCap = Number(row.pannel_cap) || 100;
                const pannelSlots = calculateAssemblySchedule(finishingSchedule, pannelCap, holidays);
                const pannelCalendar = createCalendarArray(deliveryDate, pannelSlots);

                await client.query(
                    `INSERT INTO demand_item_assembly 
                    (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        row.demand_id, row.demand_item_id, row.item_id, row.assembly_code_pannel,
                        `[PANNEL] ${row.pannel_desc}`, row.uom, realQty, realPcs,
                        JSON.stringify(pannelCalendar), row.pannel_wh || 'WIPA'
                    ]
                );

                // Update referensi agar Core mundur dari jadwal Pannel yang baru dibuat
                lastScheduleRef = pannelSlots;
            }

            // --- B. PROSES CORE ---
            if (row.assembly_code_core) {
                const coreCap = Number(row.core_cap) || 100;
                const coreSlots = calculateAssemblySchedule(lastScheduleRef, coreCap, holidays);
                const coreCalendar = createCalendarArray(deliveryDate, coreSlots);

                await client.query(
                    `INSERT INTO demand_item_assembly 
                    (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        row.demand_id, row.demand_item_id, row.item_id, row.assembly_code_core,
                        `[CORE] ${row.core_desc}`, row.uom, realQty, realPcs,
                        JSON.stringify(coreCalendar), row.core_wh || 'WIPA'
                    ]
                );
            }
        }

        // 4. Update flag status demand
        await client.query('UPDATE demands SET is_assembly_generated = true WHERE id = $1', [demandId]);

        await client.query('COMMIT');
        res.json({ message: "Generate Assembly Sequential Berhasil (Jeda 2 Shift & Filter Libur)" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Assembly Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

// Helper function agar kode lebih bersih
const createCalendarArray = (deliveryDate, slots) => {
    const calendar = [];
    for (let i = 14; i >= 0; i--) {
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
    return calendar;
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