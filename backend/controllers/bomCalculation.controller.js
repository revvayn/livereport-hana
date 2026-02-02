const db = require("../db");

exports.getBOMCalculation = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        po.plan_id,
        po.component_code AS fg_code,
        b.component_code AS component_code,
        b.component_description,
        -- Rumus per pcs FG dikali qty plan dikali rasio komponen
        ROUND(
          (b.quantity / b.qtypcs_item) * po.qty_plan / COALESCE(b.ratio_component, 1)
          , 6
        ) AS required_qty,
        COALESCE(i.on_hand_qty,0) AS on_hand_qty,
        COALESCE(i.reserved_qty,0) AS reserved_qty,
        ROUND(
          (b.quantity / b.qtypcs_item) * po.qty_plan * COALESCE(b.ratio_component, 1)
          - COALESCE(i.on_hand_qty,0) + COALESCE(i.reserved_qty,0)
          , 6
        ) AS shortage,
        po.due_date,
        po.order_type,
        po.status AS planned_status
      FROM planned_order po
      JOIN bill_of_materials b 
        ON po.component_code = b.product_item
      LEFT JOIN inventory i 
        ON b.component_code = i.item_code
      WHERE po.status = 'PLANNED'
      ORDER BY po.plan_id, b.linenum
    `);

    // Tandai parent row untuk React
    const rows = result.rows;
    const output = [];
    let lastPlanId = null;

    rows.forEach(row => {
      if (row.plan_id !== lastPlanId) {
        output.push({
          plan_id: row.plan_id,
          fg_code: row.fg_code,
          isParent: true
        });
        lastPlanId = row.plan_id;
      }
      output.push({ ...row, isParent: false });
    });

    res.json(output);

  } catch (err) {
    console.error("BOM Calculation Error:", err);
    res.status(500).json({ message: "Gagal mengambil BOM calculation" });
  }
};
