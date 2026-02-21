const pool = require("../db");

// GET all item routings
exports.getItemRoutings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ir.id, ir.item_id, i.item_code, i.description as item_name,
             ir.operation_id, o.operation_name,
             ir.pcs,
             ir.cycle_time_min, ir.sequence
      FROM item_routings ir
      LEFT JOIN items i ON ir.item_id = i.id
      LEFT JOIN operations o ON ir.operation_id = o.id
      ORDER BY ir.sequence ASC
    `);
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item routings" });
  }
};

// GET single item routing
exports.getItemRoutingById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM item_routings WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Item routing not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item routing" });
  }
};

// CREATE item routing
exports.createItemRouting = async (req, res) => {
  const { item_id, operation_id, pcs, cycle_time_min, sequence } = req.body;

  if (!item_id || !operation_id || pcs === "" || sequence === "" || sequence === undefined) {
    return res.status(400).json({
      error: "Item, Operation, PCS, dan Sequence wajib diisi!"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO item_routings(item_id, operation_id, pcs, cycle_time_min, sequence)
       VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [item_id, operation_id, pcs, cycle_time_min || 0, sequence]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("CREATE ROUTING ERROR:", err.message);
    res.status(500).json({ error: "Gagal membuat routing: " + err.message });
  }
};

// UPDATE item routing
exports.updateItemRouting = async (req, res) => {
  const { id } = req.params;
  const { item_id, operation_id, pcs, cycle_time_min, sequence } = req.body;

  if (!item_id || !operation_id || pcs === "" || sequence === "" || sequence === undefined) {
    return res.status(400).json({
      error: "Item, Operation, PCS, dan Sequence tidak boleh kosong."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE item_routings 
       SET item_id=$1, operation_id=$2, pcs=$3, cycle_time_min=$4, sequence=$5
       WHERE id=$6 RETURNING *`,
      [item_id, operation_id, pcs, cycle_time_min || 0, sequence, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Data routing tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    res.status(500).json({ error: "Gagal update: " + err.message });
  }
};

// DELETE item routing
exports.deleteItemRouting = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM item_routings WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Item routing not found" });
    res.json({ message: "Item routing deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item routing" });
  }
};
