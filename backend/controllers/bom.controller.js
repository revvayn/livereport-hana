const XLSX = require("xlsx");
const pool = require("../db");

/* =========================
   HELPER
========================= */
function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    return Number(String(value).replace(",", "."));
}

/* =========================
   UPLOAD BOM EXCEL
========================= */
exports.uploadBOM = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "File Excel tidak ditemukan",
        });
    }

    let skipped = [];

    try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "File Excel kosong",
            });
        }

        await pool.query("BEGIN");

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];

            // VALIDASI WAJIB
            if (!r.PRODUCT_ITEM || !r.COMPONENT_ITEM) {
                skipped.push(i + 2); // baris Excel (header = 1)
                continue;
            }

            await pool.query(
                `
                INSERT INTO bill_of_materials (
                    product_item,
                    product_name,
                    quantity,
                    qtypcs_item,
                    warehouse_fg,
                    status_bom,
                    linenum,
                    component_code,
                    component_description,
                    component_quantity,
                    component_whs,
                    uom_component,
                    ratio_component
                )
                VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
                )
                `,
                [
                    r.PRODUCT_ITEM,
                    r.PRODUCT_NAME,
                    toNumber(r.QUANTITY_ITEM),
                    toNumber(r.QTYPCS_ITEM),
                    r.WAREHOUSE,
                    r.STATUS_BOM,
                    r.LINENUM,
                    r.COMPONENT_ITEM,
                    r.COMPONENT_NAME,
                    toNumber(r.QUANTITY_COMPONENT),
                    r.COMPONENT_WHS,
                    r.UOM_COMPONENT,
                    toNumber(r.RATIO_COMPONENT),
                ]
            );
        }

        await pool.query("COMMIT");

        res.json({
            success: true,
            message: "Upload BOM selesai",
            total_rows: rows.length,
            skipped_rows: skipped,
        });
    } catch (err) {
        await pool.query("ROLLBACK");
        console.error("UPLOAD BOM ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message || "Gagal upload BOM",
        });
    }
};

/* =========================
   GET BOM
========================= */
exports.getBOM = async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          product_item,
          product_name,
          quantity,
          qtypcs_item,
          warehouse_fg,
          status_bom,
          linenum,
          component_code,
          component_description,
          component_quantity,
          component_whs,
          uom_component,
          ratio_component
        FROM bill_of_materials
        ORDER BY product_item, linenum
        LIMIT 500
      `);
  
      res.json({
        success: true,
        data: result.rows,
      });
    } catch (err) {
      console.error("GET BOM ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data BOM",
      });
    }
  };
  
