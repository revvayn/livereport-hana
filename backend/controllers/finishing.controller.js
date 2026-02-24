const pool = require("../db");

// GET finishing by item_id (Digunakan saat user pilih Item di Frontend)
exports.getFinishingByItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM item_finishing WHERE items_id = $1 ORDER BY id ASC",
      [itemId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data finishing" });
  }
};

// CREATE finishing
exports.createFinishing = async (req, res) => {
  const { items_id, finishing_code, description, warehouse } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO item_finishing (items_id, finishing_code, description, warehouse) VALUES ($1, $2, $3, $4) RETURNING *",
      [items_id, finishing_code, description, warehouse]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menambah data finishing" });
  }
};

// UPDATE finishing
exports.updateFinishing = async (req, res) => {
  const { id } = req.params;
  const { finishing_code, description, warehouse } = req.body;
  try {
    const result = await pool.query(
      "UPDATE item_finishing SET finishing_code=$1, description=$2, warehouse=$3 WHERE id=$4 RETURNING *",
      [finishing_code, description, warehouse, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal update data finishing" });
  }
};

// DELETE finishing
exports.deleteFinishing = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM item_finishing WHERE id = $1", [id]);
    res.json({ message: "Data finishing dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus data finishing" });
  }
};