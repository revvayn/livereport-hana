const pool = require("../db");

exports.getRejectRateSanding = async (req, res) => {
  try {

    /* ================= FILTER UTAMA ================= */
    const whereSANDING = `
      WHERE
        workcenter IS NOT NULL
        AND UPPER(workcenter) LIKE '%SANDING%'
        AND valid_qty_pcs > 0
    `;

    /* ================= KPI (AVG BULANAN) ================= */
    const kpiQuery = `
      WITH bulanan AS (
        SELECT
          DATE_TRUNC('month', doc_date) AS bulan,
          SUM(valid_qty_pcs) AS cek,
          SUM(reject_pcs) AS reject
        FROM production_reports
        ${whereSANDING}
        GROUP BY DATE_TRUNC('month', doc_date)
      )
      SELECT
        ROUND(AVG(cek)) AS cek,
        ROUND(AVG(reject)) AS reject,
        ROUND(
          AVG(reject)::numeric / NULLIF(AVG(cek), 0) * 100,
          2
        ) AS reject_rate
      FROM bulanan
    `;

    /* ================= PER HARI ================= */
    const perHariQuery = `
      SELECT
        DATE(doc_date) AS tanggal,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs), 0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereSANDING}
      GROUP BY DATE(doc_date)
      ORDER BY tanggal
    `;

    /* ================= PER SHIFT ================= */
    const perShiftQuery = `
      SELECT
        COALESCE(shift, 'UNKNOWN') AS shift,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs), 0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereSANDING}
      GROUP BY COALESCE(shift, 'UNKNOWN')
      ORDER BY shift
    `;

    /* ================= PER KATEGORI ================= */
    const kategoriQuery = `
      SELECT
        COALESCE(kategori, 'Unknown') AS kategori,
        SUM(reject_pcs) AS reject
      FROM production_reports
      ${whereSANDING}
      GROUP BY COALESCE(kategori, 'Unknown')
      ORDER BY reject DESC
    `;

    /* ================= TOP 3 BUYER ================= */
    const topBuyerQuery = `
      SELECT
        COALESCE(buyer_name, 'Unknown Buyer') AS buyer_name,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs), 0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereSANDING}
      GROUP BY COALESCE(buyer_name, 'Unknown Buyer')
      ORDER BY reject_rate DESC
      LIMIT 3
    `;

    /* ================= DETAIL TABLE ================= */
    const detailQuery = `
      SELECT
        EXTRACT(YEAR FROM doc_date) AS tahun,
        TO_CHAR(doc_date, 'MM') AS bulan,
        TO_CHAR(doc_date, 'DD') AS tanggal,
        COALESCE(shift, 'UNKNOWN') AS shift,
        workcenter AS mesin,
        SUM(valid_qty_pcs) AS produk_dicek,
        SUM(reject_pcs) AS pcs_reject,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs), 0) * 100,
          2
        ) AS reject_rate
      FROM production_reports
      ${whereSANDING}
      GROUP BY doc_date, shift, workcenter
      ORDER BY doc_date DESC
    `;

    /* ================= EXECUTE PARALLEL ================= */
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

    /* ================= RESPONSE ================= */
    res.json({
      kpi: kpi.rows[0] || { cek: 0, reject: 0, reject_rate: 0 },
      perHari: perHari.rows,
      perShift: perShift.rows,
      kategori: kategori.rows,
      topBuyer: topBuyer.rows,
      detail: detail.rows,
    });

  } catch (error) {
    console.error("RejectRateSanding Error:", error);
    res.status(500).json({
      message: "Gagal mengambil data Reject Rate Sanding",
      error: error.message,
    });
  }
};
