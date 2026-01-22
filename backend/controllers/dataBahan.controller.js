const pool = require("../db");
const { getDummyBahanbaku } = require("../services/dummyBahanbaku.service");
const { syncGrpoReportsBulk } = require("../services/Bahanbaku.service");

/* ================= SYNC DATA GRPO (POST) ================= */
exports.syncGrpoData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate dan toDate wajib diisi",
      });
    }

    /* ================= AMBIL DATA ================= */
    const rows = await getDummyBahanbaku(fromDate, toDate);

    if (!rows || !rows.length) {
      return res.json({
        success: true,
        message: "Tidak ada data untuk disync",
        total: 0,
      });
    }

    /* ================= FILTER RANGE TANGGAL ================= */
    const start = new Date(fromDate);
    const end = new Date(toDate);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1); // end exclusive

    const filteredRows = rows.filter((r) => {
      const d = new Date(r.tgl_grpo);
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
    // HARUS SAMA DENGAN UNIQUE INDEX:
    // (tgl_grpo, no_grpo, kode_item, whs)
    const uniqueMap = new Map();

    for (const r of filteredRows) {
      const key = [
        r.tgl_grpo,
        r.no_grpo,
        r.kode_item,
        r.whs,
      ].join("|");

      // data terakhir yang dipakai
      uniqueMap.set(key, r);
    }

    const dedupedRows = Array.from(uniqueMap.values());

    console.log("RAW       :", rows.length);
    console.log("FILTERED  :", filteredRows.length);
    console.log("DEDUPED   :", dedupedRows.length);

    /* ================= SYNC DATABASE ================= */
    const total = await syncGrpoReportsBulk(
      dedupedRows,
      fromDate,
      toDate
    );

    res.json({
      success: true,
      message: "Sync GRPO berhasil",
      total,
    });
  } catch (err) {
    console.error("SYNC GRPO ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat sync GRPO",
      detail: err.message,
    });
  }
};

/* ================= GET DATA GRPO (GET) ================= */
exports.getGrpoDataSync = async (req, res) => {
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
          no_grpo ILIKE $1
          OR nama_vendor ILIKE $1
          OR kode_item ILIKE $1
          OR description ILIKE $1
        )
      `;
      params.push(`%${search}%`);
    }

    const dataQuery = `
      SELECT *
      FROM grpo_reports
      ${whereClause}
      ORDER BY tgl_grpo DESC, no_grpo DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM grpo_reports
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
    console.error("GET GRPO ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data GRPO",
      detail: err.message,
    });
  }
};
