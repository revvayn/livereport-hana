const pool = require("../db");
const xlsx = require('xlsx');

// GET all items
exports.getItems = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id");
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
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
  const { item_code, description, uom, warehouse } = req.body;

  // Perbaikan: Validasi warehouse
  if (!item_code || !warehouse) {
    return res.status(400).json({ error: "Item code and warehouse are required" });
  }

  // Validasi nilai warehouse (Sesuaikan jika ada warehouse lain selain GPAK)
  if (!["GPAK"].includes(warehouse)) {
    return res.status(400).json({ error: "Warehouse must be GPAK" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO items(item_code, description, uom, warehouse) VALUES($1,$2,$3,$4) RETURNING *",
      [item_code, description, uom, warehouse]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

// UPDATE item
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { item_code, description, uom, warehouse } = req.body; // Perbaikan: item_type -> warehouse

  // Perbaikan: Validasi variabel warehouse
  if (!item_code || !warehouse) {
    return res.status(400).json({ error: "Item code and warehouse are required" });
  }

  if (!["GPAK"].includes(warehouse)) {
    return res.status(400).json({ error: "Invalid warehouse name" });
  }

  try {
    const result = await pool.query(
      "UPDATE items SET item_code=$1, description=$2, uom=$3, warehouse=$4 WHERE id=$5 RETURNING *",
      [item_code, description, uom, warehouse, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Item not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
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
    // 1. Cek apakah file ada
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    // 2. Baca file dari buffer
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ error: "File Excel kosong atau format salah" });
    }

    // 3. Proses setiap baris data
    // Gunakan BEGIN & COMMIT agar jika satu gagal, semua batal (aman)
    await pool.query("BEGIN");

    for (const row of data) {
      // Pastikan nama properti (item_code, dll) sama dengan header di Excel Anda
      const { item_code, description, uom, warehouse } = row;

      // Validasi minimal
      if (!item_code || !description) continue;

      // Query UPSERT (Update jika kode sudah ada, Insert jika belum)
      const query = `
        INSERT INTO items (item_code, description, uom, warehouse)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (item_code) 
        DO UPDATE SET 
          description = EXCLUDED.description,
          uom = EXCLUDED.uom,
          warehouse = EXCLUDED.warehouse
      `;
      
      await pool.query(query, [
        item_code, 
        description, 
        uom || "PCS", 
        warehouse || "GPAK"
      ]);
    }

    await pool.query("COMMIT");
    res.json({ message: `${data.length} data berhasil diimport/diperbarui` });

  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error Import Excel:", err);
    res.status(500).json({ error: "Gagal memproses file Excel ke database" });
  }
};