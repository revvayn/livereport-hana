const pool = require("../db");

// GET ALL & SEARCH
exports.getWorkCenters = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM work_centers`;
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
  const { 
    work_center_name, 
    line_name, 
    lead_time, 
    ewh,          // Ini adalah ewh_percent (input user)
    total_lines, 
    percentage,   // Ini adalah capacity percent
    yield: yieldVal, 
    description 
  } = req.body;
  
  try {
    // RUMUS: (25200 * ewh/100) * total_lines * percentage/100
    const ewhInput = parseFloat(ewh || 0);
    const lineInput = parseInt(total_lines || 1);
    const capInput = parseFloat(percentage || 0);

    const ewh_final = Math.round((25200 * (ewhInput / 100)) * lineInput * (capInput / 100));

    const result = await pool.query(
      `INSERT INTO work_centers 
       (work_center_name, line_name, lead_time, ewh, total_lines, percentage, yield, description, ewh_final) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        work_center_name, 
        line_name, 
        lead_time || 1, 
        ewhInput,      // Disimpan ke kolom ewh
        lineInput, 
        capInput, 
        yieldVal || 100, 
        description, 
        ewh_final      // Hasil akhir masuk ke ewh_final
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE
exports.updateWorkCenter = async (req, res) => {
  const { id } = req.params;
  const { 
    work_center_name, 
    line_name, 
    lead_time, 
    ewh, 
    total_lines, 
    percentage, 
    yield: yieldVal, 
    description 
  } = req.body;
  
  try {
    const ewhInput = parseFloat(ewh || 0);
    const lineInput = parseInt(total_lines || 1);
    const capInput = parseFloat(percentage || 0);

    const ewh_final = Math.round((25200 * (ewhInput / 100)) * lineInput * (capInput / 100));

    const result = await pool.query(
      `UPDATE work_centers SET 
        work_center_name=$1, 
        line_name=$2, 
        lead_time=$3, 
        ewh=$4, 
        total_lines=$5, 
        percentage=$6, 
        yield=$7, 
        description=$8, 
        ewh_final=$9, 
        updated_at=NOW() 
       WHERE id=$10 RETURNING *`,
      [
        work_center_name, 
        line_name, 
        lead_time, 
        ewhInput, 
        lineInput, 
        capInput, 
        yieldVal, 
        description, 
        ewh_final, 
        id
      ]
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