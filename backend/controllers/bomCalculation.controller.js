const db = require("../db");

exports.getBOMCalculation = async (req, res) => {
  try {
    const result = await db.query(`
      WITH mrp_base AS (
  SELECT
    po.plan_id,
    po.component_code        AS fg_code,
    po.due_date,
    po.order_type,
    po.status                AS planned_status,

    b.component_code,
    b.component_description,
    b.linenum,

    -- kebutuhan per plan
    ROUND(
      (b.quantity / b.qtypcs_item) * po.qty_plan
      / COALESCE(b.ratio_component, 1),
      6
    ) AS required_qty,

    i.warehouse,
    COALESCE(i.on_hand_qty, 0)    AS on_hand_qty,
    COALESCE(i.reserved_qty, 0)   AS reserved_qty

  FROM planned_order po
  JOIN bill_of_materials b
    ON po.component_code = b.product_item
  LEFT JOIN inventory i
    ON i.item_code = b.component_code
   AND i.warehouse = 'MAIN'     -- ganti sesuai gudang aktif

  WHERE po.status = 'PLANNED'
),

mrp_calc AS (
  SELECT
    *,
    -- net stock awal
    (on_hand_qty - reserved_qty) AS net_available,

    -- kebutuhan kumulatif berdasarkan waktu
    SUM(required_qty) OVER (
      PARTITION BY component_code, warehouse
      ORDER BY due_date ASC, plan_id ASC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_required
  FROM mrp_base
)

SELECT
  plan_id,
  fg_code,
  component_code,
  component_description,
  required_qty,
  on_hand_qty,
  reserved_qty,

  -- shortage MRP sesungguhnya
  ROUND(
    GREATEST(cumulative_required - net_available, 0),
    6
  ) AS shortage,

  due_date,
  order_type,
  planned_status

FROM mrp_calc
ORDER BY
  due_date ASC,
  plan_id ASC,
  linenum ASC;



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

