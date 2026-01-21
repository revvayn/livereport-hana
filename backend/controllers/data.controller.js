const pool = require("../db");
const { getDummyProduction } = require("../services/dummyProduction.service");
const { syncProductionReportsBulk } = require("../services/production.service");

/* ================= SYNC DATA (POST) ================= */
exports.syncData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate dan toDate wajib diisi",
      });
    }

    /* ================= AMBIL DATA ================= */
    const rows = await getDummyProduction(fromDate, toDate);

    if (!rows.length) {
      return res.json({
        success: true,
        message: "Tidak ada data untuk disync",
        total: 0,
      });
    }

    /* ================= FILTER RANGE TANGGAL (AMAN) ================= */
    const start = new Date(fromDate);
    const end = new Date(toDate);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // < end + 1 hari

    const filteredRows = rows.filter((r) => {
      const d = new Date(r.doc_date);
      return d >= start && d < end;
    });

    if (!filteredRows.length) {
      return res.json({
        success: true,
        message: "Tidak ada data dalam range tanggal",
        total: 0,
      });
    }

    /* ================= DEDUP DATA (WAJIB) ================= */
    // SAMAKAN DENGAN UNIQUE INDEX DATABASE
    const uniqueMap = new Map();

    for (const r of filteredRows) {
      const key = [
        r.doc_date,
        r.production_no,
        r.sales_order_no,
        r.item_code,
        r.mesin,
      ].join("|");

      // record terakhir yang dipakai
      uniqueMap.set(key, r);
    }

    const dedupedRows = Array.from(uniqueMap.values());

    console.log("RAW       :", rows.length);
    console.log("FILTERED  :", filteredRows.length);
    console.log("DEDUPED   :", dedupedRows.length);

    /* ================= SYNC DB ================= */
    const total = await syncProductionReportsBulk(
      dedupedRows,
      fromDate,
      toDate
    );

    res.json({
      success: true,
      message: "Sync berhasil",
      total,
    });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat sync data",
      detail: err.message,
    });
  }
};

/* ================= GET DATA SYNC (GET) ================= */
exports.getDataSync = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    let params = [];

    if (search) {
      whereClause = `
        WHERE (
          production_no ILIKE $1
          OR buyer_name ILIKE $1
          OR item_description ILIKE $1
        )
      `;
      params.push(`%${search}%`);
    }

    const dataQuery = `
      SELECT *
      FROM production_reports
      ${whereClause}
      ORDER BY doc_date DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM production_reports
      ${whereClause}
    `;

    const countResult = await pool.query(
      countQuery,
      params.slice(0, params.length - 2)
    );

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        totalPage: Math.ceil(countResult.rows[0].total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("GET DATA SYNC ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      detail: err.message,
    });
  }
};
