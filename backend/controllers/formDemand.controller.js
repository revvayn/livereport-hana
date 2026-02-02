const db = require("../db");

/* ================= CREATE DEMAND ================= */
exports.createDemand = async (req, res) => {
  try {
    const { item_code, qty_demand, due_date, demand_type, reference_no } =
      req.body;

    if (!item_code || !qty_demand || !due_date || !demand_type) {
      return res.status(400).json({ message: "Data demand belum lengkap" });
    }

    await db.query(
      `
      INSERT INTO demand
      (item_code, qty_demand, due_date, demand_type, reference_no)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [item_code, qty_demand, due_date, demand_type, reference_no]
    );

    res.json({ message: "Demand berhasil disimpan" });
  } catch (err) {
    console.error("CREATE DEMAND ERROR:", err);
    res.status(500).json({ message: "Gagal menyimpan demand" });
  }
};

/* ================= GET DEMAND ================= */
exports.getDemand = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        demand_id,
        item_code,
        qty_demand,
        due_date,
        demand_type,
        reference_no,
        status,
        created_at
      FROM demand
      ORDER BY due_date ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET DEMAND ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data demand" });
  }
};

