const pool = require("../db");

// GET all item routings - Hanya mengambil kolom yang ada di database
exports.getItemRoutings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ir.id, 
        -- Data Level 1: Packing
        ir.item_code, i.description as item_desc, i.warehouse as item_wh,
        -- Data Level 2: Finishing
        ir.finishing_code, f.description as finishing_desc, f.warehouse as finishing_wh,
        -- Data Level 3: Pannel
        ir.assembly_code_pannel, ap.description as pannel_desc, ap.warehouse as pannel_wh,
        -- Data Level 4: Core
        ir.assembly_code_core, ac.description as core_desc, ac.warehouse as core_wh
      FROM item_routings ir
      LEFT JOIN items i ON ir.item_code = i.item_code
      LEFT JOIN item_finishing f ON ir.finishing_code = f.finishing_code
      LEFT JOIN item_assembly_pannel ap ON ir.assembly_code_pannel = ap.assembly_code
      LEFT JOIN item_assembly_core ac ON ir.assembly_code_core = ac.assembly_code
      ORDER BY ir.id DESC
    `);
    res.json(result.rows || []);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data routing: " + err.message });
  }
};

// CREATE item routing - Hanya input 4 kolom code
exports.createItemRouting = async (req, res) => {
  const { 
    item_code, finishing_code, assembly_code_pannel, assembly_code_core 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO item_routings(
        item_code, finishing_code, assembly_code_pannel, assembly_code_core
      ) VALUES($1, $2, $3, $4) RETURNING *`,
      [item_code, finishing_code, assembly_code_pannel, assembly_code_core]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).json({ error: "Gagal membuat routing: " + err.message });
  }
};

// UPDATE item routing
exports.updateItemRouting = async (req, res) => {
  const { id } = req.params;
  const { 
    item_code, finishing_code, assembly_code_pannel, assembly_code_core 
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE item_routings 
       SET item_code=$1, finishing_code=$2, assembly_code_pannel=$3, assembly_code_core=$4
       WHERE id=$5 RETURNING *`,
      [item_code, finishing_code, assembly_code_pannel, assembly_code_core, id]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Gagal update routing" });
  }
};

// DELETE item routing
exports.deleteItemRouting = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM item_routings WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
    }
    res.json({ message: "Routing deleted" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Gagal hapus routing" });
  }
};