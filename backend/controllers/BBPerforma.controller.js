const pool = require("../db");

const getKedatanganGrader = async (req, res) => {
    try {
        const { tahun, bulan } = req.query;

        console.log("PARAM:", { tahun, bulan });

        const sql = `
SELECT
  nama_grader,

  -- LOG 5F
  SUM(CASE WHEN group_rotary ILIKE 'LOG 5%' THEN qty_pcs_grpo ELSE 0 END) AS log5_pcs,
  SUM(CASE WHEN group_rotary ILIKE 'LOG 5%' THEN qty_grpo ELSE 0 END) AS log5_vol,
  ROUND(
    SUM(CASE WHEN group_rotary ILIKE 'LOG 5%' THEN diameter * qty_pcs_grpo ELSE 0 END)
    /
    NULLIF(
      SUM(CASE WHEN group_rotary ILIKE 'LOG 5%' THEN qty_pcs_grpo ELSE 0 END),
      0
    ),
    3
  ) AS log5_avg_dia,

  -- LOG 9F
  SUM(CASE WHEN group_rotary ILIKE 'LOG 9%' THEN qty_pcs_grpo ELSE 0 END) AS log9_pcs,
  SUM(CASE WHEN group_rotary ILIKE 'LOG 9%' THEN qty_grpo ELSE 0 END) AS log9_vol,
  ROUND(
    SUM(CASE WHEN group_rotary ILIKE 'LOG 9%' THEN diameter * qty_pcs_grpo ELSE 0 END)
    /
    NULLIF(
      SUM(CASE WHEN group_rotary ILIKE 'LOG 9%' THEN qty_pcs_grpo ELSE 0 END),
      0
    ),
    3
  ) AS log9_avg_dia,

  -- TOTAL
  SUM(qty_pcs_grpo) AS total_pcs,
  SUM(qty_grpo) AS total_vol,

  -- JENIS KAYU
  SUM(CASE WHEN jenis_kayu ILIKE 'JABON' THEN qty_grpo ELSE 0 END) AS jabon,
  SUM(CASE WHEN jenis_kayu ILIKE 'ALBASIA' THEN qty_grpo ELSE 0 END) AS albasia,
  SUM(CASE WHEN jenis_kayu ILIKE 'MAHONI' THEN qty_grpo ELSE 0 END) AS mahoni

FROM grpo_reports
WHERE tahun = $1
  AND bulan = $2
GROUP BY nama_grader
ORDER BY total_vol DESC
`;


        const { rows } = await pool.query(sql, [tahun, bulan]);

        const ranked = rows.map((r, i) => ({
            ...r,
            rank: i + 1,
        }));

        res.json(ranked);
    } catch (error) {
        console.error("BB Performa Error:", error);
        res.status(500).json({ message: "Gagal ambil BB Performa" });
    }
};

module.exports = { getKedatanganGrader };
