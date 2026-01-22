const pool = require("../db");
const { getDummyBahanbaku } = require("../services/dummyBahanbaku.service");
const { syncGrpoReportsBulk } = require("../services/Bahanbaku.service");

/* ================= SYNC DATA GRPO ================= */
exports.syncGrpoData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate dan toDate wajib diisi",
      });
    }

    const rows = await getDummyBahanbaku(fromDate, toDate);

    if (!rows.length) {
      return res.json({
        success: true,
        message: "Tidak ada data untuk disync",
        total: 0,
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    start.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);

    const filtered = rows.filter(r => {
      const d = new Date(r.tgl_grpo);
      return d >= start && d < end;
    });

    if (!filtered.length) {
      return res.json({
        success: true,
        message: "Tidak ada data dalam range tanggal",
        total: 0,
      });
    }

    /* DEDUP sesuai UNIQUE INDEX */
    const map = new Map();
    for (const r of filtered) {
      const key = `${r.tgl_grpo}|${r.no_grpo}|${r.kode_item}|${r.whs}`;
      map.set(key, r);
    }

    const deduped = [...map.values()];

    console.log("RAW:", rows.length);
    console.log("FILTER:", filtered.length);
    console.log("DEDUP:", deduped.length);

    const total = await syncGrpoReportsBulk(deduped, fromDate, toDate);

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

/* ================= GET DATA GRPO ================= */
exports.getGrpoDataSync = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let where = "";
    let params = [];

    if (search) {
      where = `
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
      ${where}
      ORDER BY tgl_grpo DESC, no_grpo DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const data = await pool.query(dataQuery, params);

    const count = await pool.query(
      `SELECT COUNT(*)::int AS total FROM grpo_reports ${where}`,
      params.slice(0, params.length - 2)
    );

    res.json({
      success: true,
      data: data.rows,
      pagination: {
        totalPage: Math.ceil(count.rows[0].total / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("GET GRPO ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data GRPO",
      detail: err.message,
    });
  }
};
