const pool = require("../db");
const xlsx = require('xlsx');


const calculateCapacity = (cycleTime, ewhFromDb) => {
  const ct = parseInt(cycleTime);
  if (!ct || ct <= 0) return 0;
  // Jika ewhFromDb tidak ada, gunakan fallback 20160
  const ewhSeconds = ewhFromDb || 20160; 
  return Math.floor(ewhSeconds / ct);
};

const getPackingEwh = async () => {
  try {
    const res = await pool.query(
      "SELECT ewh FROM work_centers WHERE work_center_name = $1 LIMIT 1",
      ['Packing']
    );
    // Jika data "Packing" ditemukan, kembalikan nilai ewh-nya
    return res.rows.length > 0 ? res.rows[0].ewh : 20160;
  } catch (err) {
    console.error("Error fetching Packing EWH:", err);
    return 20160; // Fallback jika error
  }
};

// GET all items
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
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

// GET item by ID
exports.getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM items WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Item not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// CREATE item
exports.createItem = async (req, res) => {
  const { item_code, description, uom, warehouse, cycle_time } = req.body;
  if (!item_code || !description) return res.status(400).json({ error: "Data tidak lengkap" });

  try {
    const ewh = await getPackingEwh(); // Ambil EWH dinamis
    const capacity = calculateCapacity(cycle_time, ewh);
    
    const result = await pool.query(
      "INSERT INTO items(item_code, description, uom, warehouse, cycle_time, capacity_per_shift) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [item_code, description, uom, warehouse || 'GPAK', cycle_time || 0, capacity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal membuat item" });
  }
};

// UPDATE item
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { item_code, description, uom, warehouse, cycle_time } = req.body;
  try {
    const ewh = await getPackingEwh(); // Ambil EWH dinamis
    const capacity = calculateCapacity(cycle_time, ewh);

    const result = await pool.query(
      "UPDATE items SET item_code=$1, description=$2, uom=$3, warehouse=$4, cycle_time=$5, capacity_per_shift=$6 WHERE id=$7 RETURNING *",
      [item_code, description, uom, warehouse, cycle_time, capacity, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui item" });
  }
};

// DELETE item
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM items WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

exports.importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    const ewh = await getPackingEwh(); // Ambil sekali di luar loop untuk efisiensi

    await pool.query("BEGIN");
    for (const row of data) {
      const { item_code, description, uom, warehouse, cycle_time } = row;
      if (!item_code) continue;

      const capacity = calculateCapacity(cycle_time, ewh);
      const query = `
        INSERT INTO items (item_code, description, uom, warehouse, cycle_time, capacity_per_shift)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (item_code) 
        DO UPDATE SET 
          description = EXCLUDED.description,
          uom = EXCLUDED.uom,
          warehouse = EXCLUDED.warehouse,
          cycle_time = EXCLUDED.cycle_time,
          capacity_per_shift = EXCLUDED.capacity_per_shift
      `;
      await pool.query(query, [item_code, description, uom, warehouse, cycle_time || 0, capacity]);
    }
    await pool.query("COMMIT");
    res.json({ message: "Import berhasil" });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Gagal import" });
  }
};

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
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};