const pool = require("../db");

exports.getRejectByMachine = async (req, res) => {
  try {

    const query = `
      WITH bulanan AS (
        SELECT
          workcenter,
          DATE_TRUNC('month', doc_date) AS bulan,
          SUM(valid_qty_pcs) AS cek,
          SUM(reject_pcs) AS reject
        FROM production_reports
        WHERE
          workcenter IS NOT NULL
          AND valid_qty_pcs > 0
        GROUP BY workcenter, DATE_TRUNC('month', doc_date)
      )
      SELECT
        workcenter,
        COUNT(*) AS bulan,
        SUM(cek) AS cek,
        SUM(reject) AS reject,
        ROUND(AVG(cek)) AS avg_cek,
        ROUND(AVG(reject)) AS avg_reject,
        ROUND(
          SUM(reject)::numeric / NULLIF(SUM(cek), 0) * 100,
          1
        ) AS reject_rate
      FROM bulanan
      GROUP BY workcenter
      ORDER BY reject_rate DESC
    `;

    const { rows } = await pool.query(query);

    const data = rows.map(r => ({
      group: r.workcenter,
      bulan: Number(r.bulan),
      cek: Number(r.cek),
      reject: Number(r.reject),
      avg_cek: Number(r.avg_cek),
      avg_reject: Number(r.avg_reject),
      reject_rate: Number(r.reject_rate)
    }));

    res.json(data);

  } catch (error) {
    console.error("RejectByMachine Error:", error);
    res.status(500).json({
      message: "Gagal mengambil data reject per mesin",
      error: error.message
    });
  }
};
