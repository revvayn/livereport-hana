const pool = require("../db");
const xlsx = require('xlsx');

/* ==================== HELPER FUNCTIONS ==================== */

/**
 * Mengambil parameter EWH dan Yield khusus untuk Work Center 'Finishing'
 */
const getFinishingParams = async () => {
  try {
    const res = await pool.query(
      "SELECT ewh, yield FROM work_centers WHERE work_center_name = $1 LIMIT 1",
      ['Finishing']
    );
    
    if (res.rows.length > 0) {
      return {
        ewh: parseInt(res.rows[0].ewh) || 20160,
        // Konversi yield numerik (95.00) menjadi desimal (0.95)
        yieldFactor: parseFloat(res.rows[0].yield) / 100 || 1.0
      };
    }
    return { ewh: 20160, yieldFactor: 1.0 };
  } catch (err) {
    console.error("Error fetching Finishing params:", err);
    return { ewh: 20160, yieldFactor: 1.0 };
  }
};

/**
 * Menghitung kapasitas Finishing per shift
 * Kapasitas berkurang jika yield < 1 (karena waktu terbuang memproses reject)
 */
const calculateCapacity = (ct, ewhSeconds, yieldFactor) => {
  const cycleTime = parseInt(ct);
  if (!cycleTime || cycleTime <= 0) return 0;
  
  // Kapasitas Dasar (Total pukulan mesin per shift)
  const totalCycles = ewhSeconds / cycleTime;
  
  // Kapasitas Efektif (Hanya barang bagus/yield)
  return Math.floor(totalCycles * yieldFactor);
};

/* ==================== MASTER DATA CONTROLLERS ==================== */

// GET ALL FINISHING
exports.getAllFinishing = async (req, res) => {
  const { search } = req.query;
  try {
    let query = "SELECT * FROM item_finishing";
    let values = [];
    if (search) {
      query += " WHERE finishing_code ILIKE $1 OR description ILIKE $1";
      values = [`%${search}%`];
    }
    query += " ORDER BY id DESC";
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data master finishing" });
  }
};

// CREATE FINISHING
exports.createFinishing = async (req, res) => {
  const { finishing_code, description, warehouse, cycle_time } = req.body;
  try {
    // 1. Ambil EWH & Yield dari Work Center
    const { ewh, yieldFactor } = await getFinishingParams(); 
    
    // 2. Hitung Kapasitas Terpotong Yield
    const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
    
    const result = await pool.query(
      `INSERT INTO item_finishing (finishing_code, description, warehouse, cycle_time, capacity_per_shift) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [finishing_code, description, warehouse || 'FGOD', cycle_time || 0, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: "Kode Finishing sudah ada" });
    res.status(500).json({ error: "Gagal menambah master finishing" });
  }
};

// UPDATE FINISHING
exports.updateFinishing = async (req, res) => {
  const { id } = req.params;
  const { finishing_code, description, warehouse, cycle_time } = req.body;
  try {
    const { ewh, yieldFactor } = await getFinishingParams(); 
    const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
    
    const result = await pool.query(
      `UPDATE item_finishing 
       SET finishing_code=$1, description=$2, warehouse=$3, cycle_time=$4, capacity_per_shift=$5
       WHERE id=$6 RETURNING *`,
      [finishing_code, description, warehouse, cycle_time, capacity, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal update data finishing" });
  }
};

// IMPORT EXCEL
exports.importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // Ambil parameter satu kali di luar loop
    const { ewh, yieldFactor } = await getFinishingParams(); 

    await pool.query("BEGIN");
    for (const row of data) {
      const { finishing_code, description, warehouse, cycle_time } = row;
      if (!finishing_code) continue;

      const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
      const query = `
        INSERT INTO item_finishing (finishing_code, description, warehouse, cycle_time, capacity_per_shift)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (finishing_code) 
        DO UPDATE SET 
          description = EXCLUDED.description,
          warehouse = EXCLUDED.warehouse,
          cycle_time = EXCLUDED.cycle_time,
          capacity_per_shift = EXCLUDED.capacity_per_shift
      `;
      await pool.query(query, [finishing_code, description, warehouse, cycle_time || 0, capacity]);
    }
    await pool.query("COMMIT");
    res.json({ message: "Import berhasil dengan perhitungan Yield & EWH Finishing" });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Gagal import Excel" });
  }
};

// DELETE FINISHING
exports.deleteFinishing = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM item_finishing WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json({ message: "Data finishing dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus data finishing" });
  }
};


/* ==================== GENERATE LOGIC (STRICT BY ITEM_CODE RELATION) ==================== */

const calculateFinishingSchedule = (packingSchedule, capacityPerShift, holidays = [], leadTime = 2) => {
  if (!packingSchedule || !Array.isArray(packingSchedule)) return [];

  // 1. Ambil total Qty dari packing
  let totalQtyToProcess = 0;
  packingSchedule.forEach(day => {
      for (let s = 1; s <= 3; s++) {
          totalQtyToProcess += (day.shifts?.[`shift${s}`]?.qty || 0);
      }
  });
  if (totalQtyToProcess <= 0) return [];

  // 2. Cari shift PACKING paling pertama
  const sortedPacking = [...packingSchedule].sort((a, b) => new Date(a.date) - new Date(b.date));
  let firstPackingDayIdx = -1;
  let startShift = -1;

  for (let i = 0; i < sortedPacking.length; i++) {
      for (let s = 1; s <= 3; s++) {
          if (sortedPacking[i].shifts[`shift${s}`]?.qty > 0) {
              firstPackingDayIdx = i;
              startShift = s;
              break;
          }
      }
      if (firstPackingDayIdx !== -1) break;
  }

  if (firstPackingDayIdx === -1) return [];

  const isHoliday = (dateObj) => {
      if (dateObj.getDay() === 0) return true; // Minggu
      const dateStr = dateObj.toISOString().split('T')[0];
      return holidays.includes(dateStr);
  };

  // 3. Tentukan titik finish "Finishing" (Mundur sesuai Lead Time Shift)
  let currentDayObj = new Date(sortedPacking[firstPackingDayIdx].date);
  let currentShift = startShift;

  // Mundur sebanyak leadTime
  for (let i = 0; i < leadTime; i++) {
      currentShift--;
      if (currentShift < 1) {
          currentShift = 3;
          currentDayObj.setDate(currentDayObj.getDate() - 1);
          while (isHoliday(currentDayObj)) {
              currentDayObj.setDate(currentDayObj.getDate() - 1);
          }
      }
  }

  // 4. Mulai Plotting mundur dari titik tersebut
  const finishingDataMap = {};
  const itemCapacity = parseFloat(capacityPerShift) || 100;
  let remainingQty = totalQtyToProcess;

  while (remainingQty > 0) {
      // Jangan plot di hari libur
      while (isHoliday(currentDayObj)) {
          currentDayObj.setDate(currentDayObj.getDate() - 1);
      }

      const dateKey = currentDayObj.toISOString().split('T')[0];
      if (!finishingDataMap[dateKey]) {
          finishingDataMap[dateKey] = {
              date: dateKey,
              shifts: {
                  shift1: { qty: 0, active: false, type: "finishing" },
                  shift2: { qty: 0, active: false, type: "finishing" },
                  shift3: { qty: 0, active: false, type: "finishing" }
              }
          };
      }

      const take = Math.min(remainingQty, itemCapacity);
      finishingDataMap[dateKey].shifts[`shift${currentShift}`].qty = take;
      finishingDataMap[dateKey].shifts[`shift${currentShift}`].active = true;
      remainingQty -= take;

      // Mundur terus ke shift sebelumnya
      currentShift--;
      if (currentShift < 1) {
          currentShift = 3;
          currentDayObj.setDate(currentDayObj.getDate() - 1);
      }
  }

  return Object.values(finishingDataMap);
};

exports.generateFinishing = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
      await client.query('BEGIN');

      // 1. Ambil data Libur Nasional
      const holidayRes = await client.query(`SELECT holiday_date FROM public_holidays`);
      const holidays = holidayRes.rows.map(h => h.holiday_date.toISOString().split('T')[0]);

      // 2. Ambil Lead Time dari Work Center Finishing
      const wcRes = await client.query(
          `SELECT lead_time FROM work_centers WHERE work_center_name ILIKE $1 LIMIT 1`, 
          ['%finishing%']
      );
      const masterLeadTime = wcRes.rows.length ? wcRes.rows[0].lead_time : 2; // Default 2 jika tak ada

      const demandRes = await client.query(`SELECT delivery_date FROM demands WHERE id = $1`, [id]);
      if (demandRes.rows.length === 0) throw new Error("Demand tidak ditemukan");
      const deliveryDate = new Date(demandRes.rows[0].delivery_date);

      const itemsRes = await client.query(
          `SELECT di.id AS demand_item_id, di.item_id, di.item_code, di.uom, 
                  di.total_qty, di.pcs AS original_pcs, di.production_schedule,
                  ir.finishing_code, itf.description AS finishing_description,
                  itf.capacity_per_shift AS master_capacity 
           FROM demand_items di
           INNER JOIN item_routings ir ON ir.item_code = di.item_code 
           LEFT JOIN item_finishing itf ON itf.finishing_code = ir.finishing_code
           WHERE di.demand_id = $1`, [id]
      );

      await client.query(`DELETE FROM demand_item_finishing WHERE demand_id = $1`, [id]);

      for (const item of itemsRes.rows) {
          const packingSchedule = typeof item.production_schedule === 'string'
              ? JSON.parse(item.production_schedule) : (item.production_schedule || []);

          const shiftCapacity = parseFloat(item.master_capacity) > 0 ? parseFloat(item.master_capacity) : 100;

          // 3. Masukkan masterLeadTime ke fungsi kalkulasi
          const finishingSchedule = calculateFinishingSchedule(
              packingSchedule, 
              shiftCapacity, 
              holidays, 
              masterLeadTime
          );

          const finalCalendar = [];
            // Buat kalender berurutan dari H-20 sampai Hari H delivery
            for (let i = 20; i >= 0; i--) {
                const d = new Date(deliveryDate);
                d.setDate(deliveryDate.getDate() - i); 
                const dateStr = d.toISOString().split('T')[0];
                
                const found = finishingSchedule.find(f => f.date === dateStr);

                finalCalendar.push({
                    date: dateStr,
                    shifts: found ? found.shifts : {
                        shift1: { qty: 0, active: false, type: "finishing" },
                        shift2: { qty: 0, active: false, type: "finishing" },
                        shift3: { qty: 0, active: false, type: "finishing" }
                    }
                });
            }
            
            // Urutkan berdasarkan tanggal ASCENDING sebelum simpan agar tampilan di UI tidak terbalik
            finalCalendar.sort((a, b) => new Date(a.date) - new Date(b.date));

          await client.query(
              `INSERT INTO demand_item_finishing
              (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                  id, item.demand_item_id, item.item_id, 
                  item.finishing_code || 'N/A', 
                  item.finishing_description || 'No Description', 
                  item.uom, item.total_qty, item.original_pcs, 
                  JSON.stringify(finalCalendar)
              ]
          );
      }

      await client.query(`UPDATE demands SET is_finishing_generated=true WHERE id=$1`, [id]);
      await client.query('COMMIT');
      res.json({ message: `Generate Finishing Berhasil (Lead Time: ${masterLeadTime} Shift)` });

  } catch (err) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
  } finally {
      client.release();
  }
};

// Di finishing.controller.js
exports.generateFinishingForItem = async (demandItemId) => {
    const client = await pool.connect();
    try {
        // PERUBAHAN: Relasi melalui item_routing
        const res = await client.query(
            `SELECT di.production_schedule, di.demand_id, di.item_id, di.item_code, 
                    di.total_qty, di.pcs, di.uom, itf.finishing_code, itf.description
             FROM demand_items di
             INNER JOIN item_routing ir ON ir.item_code = di.item_code
             INNER JOIN item_finishing itf ON itf.finishing_code = ir.finishing_code
             WHERE di.id = $1`, [demandItemId]
        );

        if (res.rows.length === 0) return;

        const row = res.rows[0];
        const packingSchedule = typeof row.production_schedule === 'string'
            ? JSON.parse(row.production_schedule) : row.production_schedule;

        // Hitung jadwal finishing (Mundur 1 Shift)
        const finishingData = calculateFinishingSchedule(packingSchedule, row.pcs);

        await client.query(
            `INSERT INTO demand_item_finishing 
             (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (demand_item_id) 
             DO UPDATE SET 
                item_code = EXCLUDED.item_code,
                description = EXCLUDED.description,
                production_schedule = EXCLUDED.production_schedule,
                total_qty = EXCLUDED.total_qty,
                pcs = EXCLUDED.pcs`,
            [
                row.demand_id, demandItemId, row.item_id, row.finishing_code,
                row.description, row.uom, row.total_qty, row.pcs, JSON.stringify(finishingData)
            ]
        );
    } catch (err) {
        console.error("Error Adaptive Finishing:", err);
    } finally {
        client.release();
    }
};

/* ==================== OTHER CONTROLLERS ==================== */

exports.getFinishingItems = async (req, res) => {
    const { demandId } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM demand_item_finishing WHERE demand_id = $1 ORDER BY id ASC",
            [demandId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat data finishing items" });
    }
};

exports.updateFinishingSchedule = async (req, res) => {
    const { items } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of items) {
            await client.query(
                `UPDATE demand_item_finishing SET production_schedule=$1 WHERE id=$2`,
                [JSON.stringify(item.calendar), item.id]
            );
        }
        await client.query('COMMIT');
        res.json({ message: "Update success" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally { client.release(); }
};

exports.getAllDemands = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.id, d.so_number, d.so_date, d.customer_name, d.delivery_date,
                   d.is_generated, d.is_finishing_generated, COALESCE(ci.total_items, 0) AS total_items
            FROM demands d
            LEFT JOIN (SELECT demand_id, COUNT(*) AS total_items FROM demand_items GROUP BY demand_id) ci ON d.id = ci.demand_id
            ORDER BY d.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};