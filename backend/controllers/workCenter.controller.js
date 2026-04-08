const pool = require("../db");

// GET ALL & SEARCH
exports.getWorkCenters = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT *, 
      ROUND((ewh::numeric / 25200) * 100) as ewh_percent 
      FROM work_centers`;
    let params = [];

    if (search) {
      query += " WHERE work_center_name ILIKE $1 OR line_name ILIKE $1";
      params.push(`%${search}%`);
    }
    
    query += " ORDER BY id DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.createWorkCenter = async (req, res) => {
  const { work_center_name, line_name, lead_time, ewh, yield, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO work_centers (work_center_name, line_name, lead_time, ewh, yield, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [work_center_name, line_name, lead_time || 1, ewh || 20160, yield || 100, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
exports.updateWorkCenter = async (req, res) => {
  const { id } = req.params;
  const { work_center_name, line_name, lead_time, ewh, yield: yieldVal, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE work_centers SET work_center_name=$1, line_name=$2, lead_time=$3, ewh=$4, yield=$5, description=$6, updated_at=NOW() 
       WHERE id=$7 RETURNING *`,
      [work_center_name, line_name, lead_time, ewh, yieldVal, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteWorkCenter = async (req, res) => {
  try {
    await pool.query("DELETE FROM work_centers WHERE id = $1", [req.params.id]);
    res.json({ message: "Work Center deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};