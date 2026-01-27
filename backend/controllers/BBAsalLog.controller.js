const pool = require("../db");

exports.getAsalLogDashboard = async (req, res) => {
  try {
    /* ==========================================================
       BULAN TERAKHIR YANG ADA DATA (AMAN DARI DATA KOSONG)
    ========================================================== */
    const lastMonthQuery = `
      SELECT DATE_TRUNC('month', MAX(tgl_grpo)) AS bulan
      FROM grpo_reports
    `;

    const lastMonthResult = await pool.query(lastMonthQuery);
    const lastMonth = lastMonthResult.rows[0]?.bulan;

    if (!lastMonth) {
      return res.json({
        bulan_ini: [],
        tahun_2025: [],
      });
    }

    /* ==========================================================
       TOP 5 ASAL LOG BERDASARKAN DAERAH (BULAN TERAKHIR)
       sumber: asal_barang
    ========================================================== */
    const bulanIniQuery = `
      SELECT
        asal_barang AS daerah_asal,
        SUM(qty_grpo) AS qty
      FROM grpo_reports
      WHERE DATE_TRUNC('month', tgl_grpo) = $1
      GROUP BY asal_barang
      ORDER BY qty DESC
      LIMIT 5
    `;

    /* ==========================================================
       TOP 5 ASAL LOG BERDASARKAN KOTA (TAHUN 2025)
       sumber: kota_asal
    ========================================================== */
    const tahunQuery = `
      SELECT
        kota_asal AS kota,
        SUM(qty_grpo) AS qty
      FROM grpo_reports
      WHERE EXTRACT(YEAR FROM tgl_grpo) = 2025
      GROUP BY kota_asal
      ORDER BY qty DESC
      LIMIT 5
    `;

    const [bulanIni, tahun] = await Promise.all([
      pool.query(bulanIniQuery, [lastMonth]),
      pool.query(tahunQuery),
    ]);

    /* ==========================================================
       RESPONSE FORMAT (SIAP FRONTEND)
    ========================================================== */
    res.json({
      bulan_ini: bulanIni.rows.map((r, i) => ({
        rank: i + 1,
        daerah_asal: r.daerah_asal,
        qty: Number(r.qty),
      })),
      tahun_2025: tahun.rows.map((r, i) => ({
        rank: i + 1,
        kota: r.kota,
        qty: Number(r.qty),
      })),
    });

  } catch (err) {
    console.error("ASAL LOG DASHBOARD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data Asal Log",
    });
  }
};
