const XLSX = require("xlsx");
const pool = require("../db");

/* ================= GET ITEMS ================= */
exports.getItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const search = req.query.search || "";
  const offset = (page - 1) * limit;

  try {
    const dataQuery = `
      SELECT *
      FROM items
      WHERE item_code ILIKE $1
         OR item_name ILIKE $1
      ORDER BY item_code
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM items
      WHERE item_code ILIKE $1
         OR item_name ILIKE $1
    `;

    const dataResult = await pool.query(dataQuery, [
      `%${search}%`,
      limit,
      offset,
    ]);

    const countResult = await pool.query(countQuery, [`%${search}%`]);

    const totalData = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    res.json({
      data: dataResult.rows,
      page,
      totalPages,
      totalData,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data item" });
  }
};

/* ================= UPLOAD ITEMS ================= */
exports.uploadItems = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File Excel tidak ditemukan" });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let inserted = 0;

    for (const row of rows) {
      if (!row.item_code || !row.item_name) continue;

      await pool.query(
        `
        INSERT INTO items (
          item_code,
          item_name,
          item_type,
          uom,
          lead_time_days,
          safety_stock
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (item_code) DO UPDATE SET
          item_name = EXCLUDED.item_name,
          item_type = EXCLUDED.item_type,
          uom = EXCLUDED.uom,
          lead_time_days = EXCLUDED.lead_time_days,
          safety_stock = EXCLUDED.safety_stock
        `,
        [
          row.item_code,
          row.item_name,
          row.item_type,
          row.uom,
          row.lead_time_days || 0,
          row.safety_stock || 0,
        ]
      );

      inserted++;
    }

    res.json({ message: `Upload berhasil (${inserted} item)` });
  } catch (err) {
    res.status(500).json({ message: "Upload item gagal" });
  }
};

/* ================= CLEAR ITEMS ================= */
exports.clearItems = async (req, res) => {
  try {
    await pool.query("DELETE FROM items");
    res.json({ message: "Data item berhasil dikosongkan" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus data item" });
  }
};
