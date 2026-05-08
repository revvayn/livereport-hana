const pool = require("../db");

// 1. Fungsi MRP Calculation (Menggunakan CTE manual 4 Stage)
exports.getMrpCalculation = async (req, res) => {
  const { demandId } = req.params;
  try {
    const query = `
      WITH demand_data AS (
        SELECT di.demand_id, di.item_code as packing_code, COALESCE(di.pcs, 0) as packing_qty 
        FROM public.demand_items di WHERE di.demand_id = $1
      ),
      routing_path AS (
        SELECT d.packing_code, d.packing_qty, ir.finishing_code, ir.assembly_code_pannel, ir.assembly_code_core
        FROM demand_data d
        LEFT JOIN public.item_routings ir ON d.packing_code = ir.item_code
      ),
      all_stages AS (
        -- Ambil Kode Item di tiap tahapan routing
        SELECT r.packing_code as product_parent, r.packing_code as source_item, '1. PACKING' as stage_name, r.packing_qty FROM routing_path r
        UNION ALL
        SELECT r.packing_code, r.finishing_code, '2. FINISHING', r.packing_qty FROM routing_path r WHERE r.finishing_code IS NOT NULL
        UNION ALL
        SELECT r.packing_code, r.assembly_code_pannel, '3. ASSEMBLY PANNEL', r.packing_qty FROM routing_path r WHERE r.assembly_code_pannel IS NOT NULL
        UNION ALL
        SELECT r.packing_code, r.assembly_code_core, '4. ASSEMBLY CORE', r.packing_qty FROM routing_path r WHERE r.assembly_code_core IS NOT NULL
      )
      SELECT 
        s.product_parent as fg_group, -- Untuk grouping di frontend
        s.source_item as product_item, -- Kode Item dari Routing (Ini yang diminta)
        s.stage_name as stage,
        b.component_code, 
        b.component_description,
        b.uom_component as uom, 
        b.ratio_component as ratio,
        s.packing_qty as item_pcs,
        ROUND(
          (
            ( (COALESCE(b.quantity, 0)::FLOAT / NULLIF(b.qtypcs_item, 0)::FLOAT) * s.packing_qty::FLOAT ) 
            / NULLIF(COALESCE(b.ratio_component, 0), 0)::FLOAT
          )::NUMERIC, 
          4
        ) AS total_req 
      FROM all_stages s
      JOIN public.bill_of_materials b ON s.source_item = b.product_item
      ORDER BY s.product_parent, s.stage_name ASC;
    `;

    const result = await pool.query(query, [demandId]);
    const infoQuery = await pool.query("SELECT * FROM public.demands WHERE id = $1", [demandId]);

    const grouped = result.rows.reduce((acc, row) => {
      if (!acc[row.fg_group]) acc[row.fg_group] = [];
      acc[row.fg_group].push(row);
      return acc;
    }, {});

    res.json({ info: infoQuery.rows[0] || {}, mrp_data: grouped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Fungsi Full Routing BOM (Menggunakan RECURSIVE)
exports.calculateFullRoutingBOM = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      WITH RECURSIVE routing_hierarchy AS (
        SELECT 
            di.demand_id,
            di.item_code as current_item,
            di.item_code as original_parent, 
            '1. PACKING' as stage,
            COALESCE(di.pcs, 0) as item_pcs,
            1 as level
        FROM public.demand_items di
        WHERE di.demand_id = $1
        UNION ALL
        SELECT 
            rh.demand_id,
            CASE 
                WHEN rh.level = 1 THEN ir.finishing_code
                WHEN rh.level = 2 THEN ir.assembly_code_pannel
                WHEN rh.level = 3 THEN ir.assembly_code_core
            END,
            rh.original_parent,
            CASE 
                WHEN rh.level = 1 THEN '2. FINISHING'
                WHEN rh.level = 2 THEN '3. ASSEMBLY PANNEL'
                WHEN rh.level = 3 THEN '4. ASSEMBLY CORE'
            END,
            rh.item_pcs,
            rh.level + 1
        FROM routing_hierarchy rh
        JOIN public.item_routings ir ON rh.current_item = ir.item_code
        WHERE rh.level < 4 
          AND (
            (rh.level = 1 AND ir.finishing_code IS NOT NULL) OR
            (rh.level = 2 AND ir.assembly_code_pannel IS NOT NULL) OR
            (rh.level = 3 AND ir.assembly_code_core IS NOT NULL)
          )
      )
      SELECT 
          rh.original_parent as parent_code,
          rh.stage,
          b.component_code,
          b.component_description,
          b.uom_component as uom,
          b.ratio_component as ratio,
          rh.item_pcs,
          -- RUMUS DISESUAIKAN: ((Qty BOM / PCS Standar BOM) * Demand) / Ratio
          ROUND(
            (
              ( (COALESCE(b.quantity, 0)::FLOAT / NULLIF(b.qtypcs_item, 0)::FLOAT) * rh.item_pcs::FLOAT ) 
              / NULLIF(COALESCE(b.ratio_component, 0), 0)::FLOAT
            )::NUMERIC, 
            4
          ) AS total_req
      FROM routing_hierarchy rh
      JOIN public.bill_of_materials b ON rh.current_item = b.product_item
      ORDER BY rh.original_parent, rh.level ASC;
    `;

    const result = await pool.query(query, [id]);
    const grouped = result.rows.reduce((acc, row) => {
      const parent = row.parent_code;
      if (!acc[parent]) acc[parent] = [];
      acc[parent].push(row);
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};