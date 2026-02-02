const db = require("../db");

exports.runMRP = async (req, res) => {
  try {
    // Ambil semua demand yang statusnya NEW
    const demandResult = await db.query(`
      SELECT demand_id, item_code, qty_demand, due_date
      FROM demand
      WHERE status = 'NEW'
    `);

    if (demandResult.rows.length === 0) {
      return res.status(400).json({ message: "Tidak ada demand NEW" });
    }

    // Loop setiap demand dan simpan ke planned_order
    for (const d of demandResult.rows) {
      await db.query(
        `
        INSERT INTO planned_order
        (component_code, qty_plan, due_date, order_type, status, reference_demand, created_at)
        VALUES ($1, $2, $3, 'PRODUCTION', 'PLANNED', $4, NOW())
        `,
        [d.item_code, d.qty_demand, d.due_date, d.demand_id]
      );

      // Update status demand menjadi PLANNED
      await db.query(
        `UPDATE demand SET status = 'PLANNED' WHERE demand_id = $1`,
        [d.demand_id]
      );
    }

    res.json({ message: "MRP berhasil dijalankan" });
  } catch (err) {
    console.error("RUN MRP ERROR:", err);
    res.status(500).json({ message: "Gagal menjalankan MRP" });
  }
};
