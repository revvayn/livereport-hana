const db = require("../db");

exports.getBOMCalculation = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        po.plan_id,
        po.component_code AS fg_code,
        po.due_date,
        po.order_type,
        po.status AS planned_status,

        b.component_code,
        b.component_description,

        ROUND(
          (b.quantity / b.qtypcs_item) * po.qty_plan / COALESCE(b.ratio_component, 1),
          6
        ) AS required_qty,

        COALESCE(i.on_hand_qty, 0) AS on_hand_qty,
        COALESCE(i.reserved_qty, 0) AS reserved_qty,

        ROUND(
          (b.quantity / b.qtypcs_item) * po.qty_plan
          - COALESCE(i.on_hand_qty, 0)
          + COALESCE(i.reserved_qty, 0),
          6
        ) AS shortage

      FROM planned_order po
      JOIN bill_of_materials b
        ON po.component_code = b.product_item
      LEFT JOIN inventory i
        ON b.component_code = i.item_code
      WHERE po.status = 'PLANNED'
      ORDER BY po.plan_id, b.linenum
    `);

    const rows = result.rows;
    const output = [];
    let lastPlanId = null;

    rows.forEach(row => {
      if (row.plan_id !== lastPlanId) {
        // ✅ PARENT ROW LENGKAP
        output.push({
          plan_id: row.plan_id,
          fg_code: row.fg_code,
          due_date: row.due_date,
          order_type: row.order_type,
          planned_status: row.planned_status,
          isParent: true
        });
        lastPlanId = row.plan_id;
      }

      // ✅ CHILD ROW
      output.push({
        ...row,
        isParent: false
      });
    });

    res.json(output);
  } catch (err) {
    console.error("BOM Calculation Error:", err);
    res.status(500).json({ message: "Gagal mengambil BOM calculation" });
  }
};

