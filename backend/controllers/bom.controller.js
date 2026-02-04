const XLSX = require("xlsx");
const pool = require("../db");

function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
  
    // Kalau sudah number dari Excel, langsung pakai
    if (typeof value === "number") return value;
  
    // Kalau string (locale ID / EU)
    const normalized = value
      .toString()
      .replace(/\./g, "")   // hapus ribuan
      .replace(",", ".");   // desimal
  
    const num = Number(normalized);
    return isNaN(num) ? null : num;
  }
  

exports.uploadBOM = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "File Excel tidak ditemukan" });
    }
  
    const skipped = [];
    let inserted = 0;
  
    try {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
  
      if (rows.length === 0) {
        return res.status(400).json({ message: "Excel kosong" });
      }
  
      await pool.query("BEGIN");
  
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
  
        if (!r.PRODUCT_ITEM || !r.COMPONENT_ITEM) {
          skipped.push(i + 2);
          continue;
        }
  
        const quantityItem = toNumber(r.QUANTITY_ITEM);
        const qtyPcs = toNumber(r.QTYPCS_ITEM);
        const qtyComponent = toNumber(r.QUANTITY_COMPONENT);
        const ratio = toNumber(r.RATIO_COMPONENT);
  
        if (quantityItem === null || qtyPcs === null || qtyComponent === null) {
          skipped.push(i + 2);
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
            quantityItem,
            qtyPcs,
            r.WAREHOUSE,
            r.STATUS_BOM,
            r.LINENUM ?? 0,
            r.COMPONENT_ITEM,
            r.COMPONENT_NAME,
            qtyComponent,
            r.COMPONENT_WHS,
            r.UOM_COMPONENT,
            ratio ?? 1,
          ]
        );
  
        inserted++;
      }
  
      await pool.query("COMMIT");
  
      res.json({
        success: true,
        message: "Upload BOM selesai",
        inserted,
        skipped: skipped.length,
        skippedRows: skipped.slice(0, 10),
      });
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Gagal upload BOM",
      });
    }
  };
  


/* =========================
   GET BOM
========================= */
exports.getBOM = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const search = req.query.search || "";

        const offset = (page - 1) * limit;

        let whereClause = "";
        let values = [];

        if (search) {
            whereClause = `
          WHERE 
            product_item ILIKE $1 OR
            product_name ILIKE $1
        `;
            values.push(`%${search}%`);
        }

        /* ================= DATA ================= */
        const dataQuery = `
        SELECT *
        FROM bill_of_materials
        ${whereClause}
        ORDER BY product_item, linenum
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `;

        const dataResult = await pool.query(
            dataQuery,
            [...values, limit, offset]
        );

        /* ================= TOTAL ================= */
        const countQuery = `
        SELECT COUNT(*)
        FROM bill_of_materials
        ${whereClause}
      `;

        const countResult = await pool.query(countQuery, values);
        const totalData = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalData / limit);

        res.json({
            data: dataResult.rows,
            page,
            totalPages,
            totalData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil data BOM" });
    }
};




exports.clearBOM = async (req, res) => {
    try {
        await pool.query("TRUNCATE TABLE bill_of_materials RESTART IDENTITY");

        res.json({
            success: true,
            message: "Data BOM berhasil dikosongkan",
        });
    } catch (err) {
        console.error("CLEAR BOM ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Gagal mengosongkan data BOM",
        });
    }
};

