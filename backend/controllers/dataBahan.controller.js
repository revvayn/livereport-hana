const pool = require("../db");
const { getDummyBahanbaku } = require("../services/dummyBahanbaku.service");
const { syncGrpoReportsBulk } = require("../services/Bahanbaku.service");

exports.syncGrpoData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate dan toDate wajib diisi",
      });
    }

    const rows = await getDummyBahanbaku();

    const filtered = rows.filter(r => {
      const d = new Date(r.tgl_grpo);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });

    if (!filtered.length) {
      return res.json({
        success: true,
        message: "Tidak ada data dalam range",
        total: 0,
      });
    }

    // DEDUP sesuai UNIQUE INDEX
    const map = new Map();
    filtered.forEach(r => {
      const key = `${r.tgl_grpo}|${r.no_grpo}|${r.kode_item}|${r.whs}`;
      map.set(key, r);
    });

    const total = await syncGrpoReportsBulk(
      [...map.values()],
      fromDate,
      toDate
    );

    res.json({
      success: true,
      message: "Sync GRPO berhasil",
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Sync GRPO gagal",
    });
  }
};

exports.getGrpoDataSync = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = (page - 1) * limit;

  let where = "";
  let params = [];

  if (search) {
    where = `
      WHERE no_grpo ILIKE $1
         OR nama_vendor ILIKE $1
         OR kode_item ILIKE $1
         OR description ILIKE $1
    `;
    params.push(`%${search}%`);
  }

  const data = await pool.query(
    `
    SELECT *
    FROM grpo_reports
    ${where}
    ORDER BY tgl_grpo DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `,
    [...params, limit, offset]
  );

  const count = await pool.query(
    `SELECT COUNT(*)::int FROM grpo_reports ${where}`,
    params
  );

  res.json({
    success: true,
    data: data.rows,
    pagination: {
      totalPage: Math.ceil(count.rows[0].count / limit),
      currentPage: page,
    },
  });
};
