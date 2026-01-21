const pool = require("../db");

exports.getRejectRateHotpress = async (req, res) => {
  try {
    const whereHOTPRESS = `
      WHERE
        workcenter IS NOT NULL
        AND UPPER(TRIM(workcenter)) LIKE '%HOTPRESS%'
        AND valid_qty_pcs > 0
    `;

    /* ================= KPI ================= */
    const kpiQuery = `
      SELECT
        COALESCE(SUM(valid_qty_pcs), 0) AS cek,
        COALESCE(SUM(reject_pcs), 0) AS reject,
        ROUND(
          COALESCE(SUM(reject_pcs),0)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereHOTPRESS}
    `;

    /* ================= PER HARI ================= */
    const perHariQuery = `
      SELECT
        DATE(doc_date) AS tanggal,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereHOTPRESS}
      GROUP BY DATE(doc_date)
      ORDER BY DATE(doc_date)
    `;

    /* ================= PER SHIFT ================= */
    const perShiftQuery = `
      SELECT
        COALESCE(shift,'UNKNOWN') AS shift,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereHOTPRESS}
      GROUP BY COALESCE(shift,'UNKNOWN')
      ORDER BY shift
    `;

    /* ================= PER KATEGORI ================= */
    const kategoriQuery = `
      SELECT
        COALESCE(kategori,'Unknown') AS kategori,
        SUM(reject_pcs) AS reject
      FROM production_reports
      ${whereHOTPRESS}
      GROUP BY COALESCE(kategori,'Unknown')
      ORDER BY reject DESC
    `;

    /* ================= TOP 3 BUYER ================= */
    const topBuyerQuery = `
      SELECT
        COALESCE(buyer_name,'Unknown Buyer') AS buyer_name,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereHOTPRESS}
      GROUP BY COALESCE(buyer_name,'Unknown Buyer')
      ORDER BY reject_rate DESC
      LIMIT 3
    `;

    /* ================= DETAIL TABLE ================= */
    const detailQuery = `
      SELECT
        EXTRACT(YEAR FROM doc_date) AS tahun,
        TO_CHAR(doc_date,'MM') AS bulan,
        TO_CHAR(doc_date,'DD') AS tgl,
        COALESCE(shift,'UNKNOWN') AS shift,
        workcenter AS mesin,
        SUM(valid_qty_pcs) AS produk_dicek,
        SUM(reject_pcs) AS pcs_reject,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereHOTPRESS}
      GROUP BY doc_date, shift, workcenter
      ORDER BY doc_date DESC
    `;

    const [
      kpi,
      perHari,
      perShift,
      kategori,
      topBuyer,
      detail,
    ] = await Promise.all([
      pool.query(kpiQuery),
      pool.query(perHariQuery),
      pool.query(perShiftQuery),
      pool.query(kategoriQuery),
      pool.query(topBuyerQuery),
      pool.query(detailQuery),
    ]);

    res.json({
      kpi: kpi.rows[0] || { cek: 0, reject: 0, reject_rate: 0 },
      perHari: perHari.rows,
      perShift: perShift.rows,
      kategori: kategori.rows,
      topBuyer: topBuyer.rows,
      detail: detail.rows,
    });

  } catch (err) {
    console.error("RejectRateHotpress Error:", err);
    res.status(500).json({
      message: "Gagal mengambil data reject Hotpress",
      error: err.message,
    });
  }
};
