const pool = require("../db");

/**
 * Bulk UPSERT grpo_reports
 * - UPSERT data baru
 * - HAPUS semua data DI LUAR rentang tanggal
 * @param {Array} rows
 * @param {String} fromDate (YYYY-MM-DD)
 * @param {String} toDate   (YYYY-MM-DD)
 */
exports.syncGrpoReportsBulk = async (rows, fromDate, toDate) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* ===============================
       1️⃣ HAPUS DATA DI LUAR RANGE
    =============================== */
    if (fromDate && toDate) {
      await client.query(
        `
        DELETE FROM grpo_reports
        WHERE tgl_grpo < $1::date
           OR tgl_grpo > $2::date
        `,
        [fromDate, toDate]
      );
    }

    /* ===============================
       2️⃣ JIKA DATA BARU KOSONG
    =============================== */
    if (!rows || rows.length === 0) {
      await client.query("COMMIT");
      return 0;
    }

    /* ===============================
       3️⃣ INSERT / UPSERT DATA BARU
    =============================== */
    const values = [];
    const placeholders = rows.map((r, i) => {
      const base = i * 31;

      const tgl = new Date(r.tgl_grpo);
      tgl.setHours(0, 0, 0, 0);

      values.push(
        tgl, r.tahun, r.bulan, r.entry_grpo, r.no_grpo,
        r.no_inv_sim, r.no_tally, r.no_ref_po, r.no_kedatangan,
        r.no_surat_jalan_vendor, r.kode_vendor, r.nama_vendor,
        r.rank, r.group_rotary, r.kode_item, r.description,
        r.qty_pcs_grpo, r.qty_grpo, r.price_per_m3, r.total_price_grpo,
        r.whs, r.status_grpo, r.kota_asal, r.asal_barang,
        r.slpcode, r.nama_grader, r.diameter, r.jenis_kayu,
        r.group_kayu, r.total_dia, r.code
      );

      return `(${Array.from({ length: 31 }, (_, k) => `$${base + k + 1}`).join(",")})`;
    });

    const query = `
  INSERT INTO grpo_reports (
    tgl_grpo, tahun, bulan, entry_grpo, no_grpo,
    no_inv_sim, no_tally, no_ref_po, no_kedatangan,
    no_surat_jalan_vendor, kode_vendor, nama_vendor,
    rank, group_rotary, kode_item, description,
    qty_pcs_grpo, qty_grpo, price_per_m3, total_price_grpo,
    whs, status_grpo, kota_asal, asal_barang,
    slpcode, nama_grader, diameter, jenis_kayu,
    group_kayu, total_dia, code
  )
  VALUES ${placeholders.join(",")}
  ON CONFLICT ON CONSTRAINT grpo_reports_conflict_unique
  DO UPDATE SET
    qty_pcs_grpo     = EXCLUDED.qty_pcs_grpo,
    qty_grpo         = EXCLUDED.qty_grpo,
    total_price_grpo = EXCLUDED.total_price_grpo,
    status_grpo      = EXCLUDED.status_grpo
`;



    await client.query(query, values);
    await client.query("COMMIT");

    return rows.length;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
