const pool = require("../db");

// GET all operations
exports.getOperations = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM operations ORDER BY id");
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch operations" });
  }
};

// GET operation by ID
exports.getOperationById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM operations WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Operation not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch operation" });
  }
};

// CREATE operation
exports.createOperation = async (req, res) => {
  const { operation_name, department } = req.body;
  if (!operation_name) {
    return res.status(400).json({ error: "Operation name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO operations(operation_name, department) VALUES($1,$2) RETURNING *",
      [operation_name, department || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create operation" });
  }
};

// UPDATE operation
exports.updateOperation = async (req, res) => {
  const { id } = req.params;
  const { operation_name, department } = req.body;
  if (!operation_name) {
    return res.status(400).json({ error: "Operation name is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE operations SET operation_name=$1, department=$2 WHERE id=$3 RETURNING *",
      [operation_name, department || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Operation not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update operation" });
  }
};

// DELETE operation
exports.deleteOperation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM operations WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Operation not found" });
    res.json({ message: "Operation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete operation" });
  }
};
