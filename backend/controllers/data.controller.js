const pool = require("../db");
const { getDummyProduction } = require("../services/dummyProduction.service");
const { syncProductionReportsBulk } = require("../services/production.service");

/* ================= SYNC DATA (POST) ================= */
exports.syncData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate)
      return res.status(400).json({
        success: false,
        message: "fromDate dan toDate wajib diisi",
      });

    const rows = await getDummyProduction(fromDate, toDate);
    if (!rows.length)
      return res.json({ success: true, message: "Tidak ada data untuk disync", total: 0 });

    const filteredRows = rows.filter((r) => {
      const d = new Date(r.doc_date);
      const start = new Date(fromDate);
      const end = new Date(toDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    });

    const total = await syncProductionReportsBulk(filteredRows, fromDate, toDate);

    res.json({ success: true, message: "Sync berhasil", total });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat sync data", detail: err.message });
  }
};

/* ================= GET DATA SYNC (GET) ================= */
exports.getDataSync = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (search) {
      whereClause = `WHERE (production_no ILIKE $1 OR buyer_name ILIKE $1 OR item_description ILIKE $1)`;
      params.push(`%${search}%`);
    }

    const dataQuery = `
      SELECT *
      FROM production_reports
      ${whereClause}
      ORDER BY doc_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);
    const countQuery = `SELECT COUNT(*) FROM production_reports ${whereClause}`;
    const countResult = await pool.query(countQuery, params.slice(0, params.length - 2));

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        totalPage: Math.ceil(countResult.rows[0].count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("GET DATA SYNC ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil data", detail: err.message });
  }
};
