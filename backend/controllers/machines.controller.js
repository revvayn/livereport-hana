const pool = require("../db");

// GET all machines
exports.getMachines = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM machines ORDER BY id");
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch machines" });
  }
};

// GET machine by ID
exports.getMachineById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM machines WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Machine not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch machine" });
  }
};

// CREATE machine
exports.createMachine = async (req, res) => {
  const { machine_code, machine_name, department } = req.body;
  if (!machine_code || !machine_name) {
    return res.status(400).json({ error: "Machine code and name are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO machines(machine_code, machine_name, department) VALUES($1,$2,$3) RETURNING *",
      [machine_code, machine_name, department || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create machine" });
  }
};

// UPDATE machine
exports.updateMachine = async (req, res) => {
  const { id } = req.params;
  const { machine_code, machine_name, department } = req.body;
  if (!machine_code || !machine_name) {
    return res.status(400).json({ error: "Machine code and name are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE machines SET machine_code=$1, machine_name=$2, department=$3 WHERE id=$4 RETURNING *",
      [machine_code, machine_name, department || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Machine not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update machine" });
  }
};

// DELETE machine
exports.deleteMachine = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM machines WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Machine not found" });
    res.json({ message: "Machine deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete machine" });
  }
};
