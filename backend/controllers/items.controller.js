const pool = require("../db");
const xlsx = require('xlsx');

/* ==================== HELPER FUNCTIONS ==================== */

/**
 * Mengambil EWH dan Yield dari tabel work_centers untuk 'Packing'
 */
const getPackingParams = async () => {
  try {
    const res = await pool.query(
      "SELECT ewh, yield FROM work_centers WHERE work_center_name = $1 LIMIT 1",
      ['Packing']
    );
    
    if (res.rows.length > 0) {
      return {
        ewh: parseInt(res.rows[0].ewh) || 20160,
        // Konversi yield (contoh: 90.00 menjadi 0.9)
        yieldFactor: parseFloat(res.rows[0].yield) / 100 || 1.0
      };
    }
    return { ewh: 20160, yieldFactor: 1.0 };
  } catch (err) {
    console.error("Error fetching Packing params:", err);
    return { ewh: 20160, yieldFactor: 1.0 };
  }
};

/**
 * Menghitung kapasitas per shift dengan mempertimbangkan Yield (Pekerjaan berulang)
 * Rumus: (EWH / CycleTime) * Yield
 */
const calculateCapacity = (cycleTime, ewhFromDb, yieldFactor) => {
  const ct = parseInt(cycleTime);
  if (!ct || ct <= 0) return 0;
  
  const ewhSeconds = ewhFromDb || 20160;
  
  // Hitung kapasitas dasar berdasarkan waktu tersedia
  const baseCapacity = ewhSeconds / ct;
  
  // Karena yield < 1 berarti ada waktu yang terbuang untuk reject,
  // maka kapasitas barang jadi (good parts) per shift akan berkurang.
  return Math.floor(baseCapacity * yieldFactor);
};

/* ==================== CONTROLLERS ==================== */

// GET ALL ITEMS
exports.getItems = async (req, res) => {
  const { search } = req.query;
  try {
    let query = "SELECT * FROM items";
    let values = [];
    if (search) {
      query += " WHERE item_code ILIKE $1 OR description ILIKE $1";
      values = [`%${search}%`];
    }
    query += " ORDER BY id DESC";
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data items" });
  }
};

// GET ITEM BY ID
exports.getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM items WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil detail item" });
  }
};

// CREATE ITEM
exports.createItem = async (req, res) => {
  const { item_code, description, uom, warehouse, cycle_time } = req.body;
  if (!item_code || !description) return res.status(400).json({ error: "Data tidak lengkap" });

  try {
    const { ewh, yieldFactor } = await getPackingParams(); 
    const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
    
    const result = await pool.query(
      `INSERT INTO items(item_code, description, uom, warehouse, cycle_time, capacity_per_shift) 
       VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      [item_code, description, uom, warehouse || 'GPAK', cycle_time || 0, capacity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat item" });
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { item_code, description, uom, warehouse, cycle_time } = req.body;
  try {
    const { ewh, yieldFactor } = await getPackingParams(); 
    const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);

    const result = await pool.query(
      `UPDATE items 
       SET item_code=$1, description=$2, uom=$3, warehouse=$4, cycle_time=$5, capacity_per_shift=$6 
       WHERE id=$7 RETURNING *`,
      [item_code, description, uom, warehouse, cycle_time, capacity, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui item" });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM items WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json({ message: "Item berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus item" });
  }
};

// IMPORT EXCEL
exports.importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File Excel tidak ditemukan" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    // Ambil parameter di luar loop agar tidak membebani database
    const { ewh, yieldFactor } = await getPackingParams(); 

    await pool.query("BEGIN");
    for (const row of data) {
      const { item_code, description, uom, warehouse, cycle_time } = row;
      if (!item_code) continue;

      const capacity = calculateCapacity(cycle_time, ewh, yieldFactor);
      
      const query = `
        INSERT INTO items (item_code, description, uom, warehouse, cycle_time, capacity_per_shift)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (item_code) DO UPDATE SET 
          description = EXCLUDED.description,
          uom = EXCLUDED.uom,
          warehouse = EXCLUDED.warehouse,
          cycle_time = EXCLUDED.cycle_time,
          capacity_per_shift = EXCLUDED.capacity_per_shift
      `;
      await pool.query(query, [item_code, description, uom, warehouse, cycle_time || 0, capacity]);
    }
    await pool.query("COMMIT");
    res.json({ message: "Import berhasil dengan perhitungan Yield dan EWH dinamis" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Gagal memproses import Excel" });
  }
};