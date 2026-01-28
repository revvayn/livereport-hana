const db = require("../db");

exports.planningFromBom = async (req, res) => {
    try {
      const { item_code, planning_qty } = req.body;
  
      // 🔒 Validasi
      if (!item_code) {
        return res.status(400).json({ message: "Item code wajib diisi" });
      }
  
      if (!planning_qty || planning_qty <= 0) {
        return res.status(400).json({ message: "Planning quantity harus > 0" });
      }
  
      // 🧮 Planning dari BOM
      const result = await db.query(
        `
        SELECT
          component_code,
          component_description,
          quantity AS bom_output_qty,
          component_quantity AS bom_component_qty,
          rasio,
          ROUND(rasio * $1, 2) AS required_quantity,
          whs
        FROM bill_of_materials
        WHERE item_code = $2
        ORDER BY component_code
        `,
        [planning_qty, item_code]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "BOM untuk item tersebut tidak ditemukan",
        });
      }
  
      res.json({
        item_code,
        planning_qty,
        materials: result.rows,
      });
    } catch (error) {
      console.error("Planning BOM Error:", error);
      res.status(500).json({ message: "Gagal generate planning BOM" });
    }
  };