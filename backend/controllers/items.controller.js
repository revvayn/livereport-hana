const pool = require("../db");

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