// controllers/plannedOrder.controller.js
const db = require("../db");

exports.getPlannedOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM planned_order ORDER BY plan_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil planned order" });
  }
};
