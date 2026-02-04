const XLSX = require("xlsx");
const pool = require("../db");

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  const normalized = value
    .toString()
    .replace(/\./g, "")
    .replace(",", ".");

  const num = Number(normalized);
  return isNaN(num) ? 0 : num;
}

/* =========================
   UPLOAD INVENTORY
========================= */
exports.uploadInventory = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File Excel tidak ditemukan" });
  }

  const skipped = [];
  let inserted = 0;
  let updated = 0;

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

      if (!r.ITEM_CODE || !r.WAREHOUSE) {
        skipped.push(i + 2);
        continue;
      }

      const onHandQty = toNumber(r.ON_HAND_QTY);
      const reservedQty = toNumber(r.RESERVED_QTY);

      const result = await pool.query(
        `
        INSERT INTO inventory (
          item_code,
          warehouse,
          on_hand_qty,
          reserved_qty,
          last_update
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (item_code, warehouse)
        DO UPDATE SET
          on_hand_qty = EXCLUDED.on_hand_qty,
          reserved_qty = EXCLUDED.reserved_qty,
          last_update = CURRENT_TIMESTAMP
        RETURNING xmax
        `,
        [
          r.ITEM_CODE,
          r.WAREHOUSE,
          onHandQty,
          reservedQty,
        ]
      );

      // xmax = 0 → insert, >0 → update
      if (result.rows[0].xmax === "0") inserted++;
      else updated++;
    }

    await pool.query("COMMIT");

    res.json({
      success: true,
      message: "Upload inventory selesai",
      inserted,
      updated,
      skipped: skipped.length,
      skippedRows: skipped.slice(0, 10),
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal upload inventory",
    });
  }
};

/* =========================
   GET INVENTORY
========================= */
exports.getInventory = async (req, res) => {
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
          item_code ILIKE $1 OR
          warehouse ILIKE $1
      `;
      values.push(`%${search}%`);
    }

    const dataQuery = `
      SELECT *
      FROM inventory
      ${whereClause}
      ORDER BY item_code, warehouse
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const dataResult = await pool.query(
      dataQuery,
      [...values, limit, offset]
    );

    const countQuery = `
      SELECT COUNT(*)
      FROM inventory
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
    res.status(500).json({ message: "Gagal mengambil data inventory" });
  }
};

/* =========================
   CLEAR INVENTORY
========================= */
exports.clearInventory = async (req, res) => {
  try {
    await pool.query("TRUNCATE TABLE inventory RESTART IDENTITY");

    res.json({
      success: true,
      message: "Data inventory berhasil dikosongkan",
    });
  } catch (err) {
    console.error("CLEAR INVENTORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengosongkan data inventory",
    });
  }
};
