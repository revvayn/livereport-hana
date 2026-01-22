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

    // --- DELETE DATA DI LUAR RANGE TANGGAL ---
    if (fromDate && toDate) {
      const deleteQuery = `
        DELETE FROM grpo_reports
        WHERE tgl_grpo::date < $1::date
           OR tgl_grpo::date > $2::date
      `;
      const del = await client.query(deleteQuery, [fromDate, toDate]);
      console.log("Deleted rows outside range:", del.rowCount);
    }

    if (!rows || rows.length === 0) {
      await client.query("COMMIT");
      return 0;
    }

    // --- PREPARE BULK UPSERT ---
    const values = [];
    const placeholders = rows.map((r, i) => {
      const base = i * 31;

      const tglGrpo = new Date(r.tgl_grpo);
      tglGrpo.setHours(0, 0, 0, 0);

      values.push(
        tglGrpo,              // 1
        r.tahun,              // 2
        r.bulan,              // 3
        r.entry_grpo,         // 4
        r.no_grpo,            // 5
        r.no_inv_sim,         // 6
        r.no_tally,           // 7
        r.no_ref_po,          // 8
        r.no_kedatangan,      // 9
        r.no_surat_jalan_vendor, // 10
        r.kode_vendor,        // 11
        r.nama_vendor,        // 12
        r.rank,               // 13
        r.group_rotary,       // 14
        r.kode_item,          // 15
        r.description,        // 16
        r.qty_pcs_grpo,       // 17
        r.qty_grpo,           // 18
        r.price_per_m3,       // 19
        r.total_price_grpo,   // 20
        r.whs,                // 21
        r.status_grpo,        // 22
        r.kota_asal,          // 23
        r.asal_barang,        // 24
        r.slpcode,            // 25
        r.nama_grader,        // 26
        r.diameter,           // 27
        r.jenis_kayu,         // 28
        r.group_kayu,         // 29
        r.total_dia,          // 30
        r.code                // 31
      );

      const group = Array.from(
        { length: 31 },
        (_, k) => `$${base + k + 1}`
      );
      return `(${group.join(",")})`;
    });

    const insertQuery = `
      INSERT INTO grpo_reports (
        tgl_grpo, tahun, bulan, entry_grpo, no_grpo,
        no_inv_sim, no_tally, no_ref_po, no_kedatangan, no_surat_jalan_vendor,
        kode_vendor, nama_vendor, rank, group_rotary,
        kode_item, description,
        qty_pcs_grpo, qty_grpo, price_per_m3, total_price_grpo,
        whs, status_grpo,
        kota_asal, asal_barang,
        slpcode, nama_grader,
        diameter, jenis_kayu, group_kayu, total_dia, code
      )
      VALUES ${placeholders.join(",")}
      ON CONFLICT (tgl_grpo, no_grpo, kode_item, whs)
      DO UPDATE SET
        tahun               = EXCLUDED.tahun,
        bulan               = EXCLUDED.bulan,
        entry_grpo          = EXCLUDED.entry_grpo,
        no_inv_sim          = EXCLUDED.no_inv_sim,
        no_tally            = EXCLUDED.no_tally,
        no_ref_po           = EXCLUDED.no_ref_po,
        no_kedatangan       = EXCLUDED.no_kedatangan,
        no_surat_jalan_vendor = EXCLUDED.no_surat_jalan_vendor,
        kode_vendor         = EXCLUDED.kode_vendor,
        nama_vendor         = EXCLUDED.nama_vendor,
        rank                = EXCLUDED.rank,
        group_rotary        = EXCLUDED.group_rotary,
        description         = EXCLUDED.description,
        qty_pcs_grpo        = EXCLUDED.qty_pcs_grpo,
        qty_grpo            = EXCLUDED.qty_grpo,
        price_per_m3        = EXCLUDED.price_per_m3,
        total_price_grpo    = EXCLUDED.total_price_grpo,
        status_grpo         = EXCLUDED.status_grpo,
        kota_asal           = EXCLUDED.kota_asal,
        asal_barang         = EXCLUDED.asal_barang,
        slpcode             = EXCLUDED.slpcode,
        nama_grader         = EXCLUDED.nama_grader,
        diameter            = EXCLUDED.diameter,
        jenis_kayu          = EXCLUDED.jenis_kayu,
        group_kayu          = EXCLUDED.group_kayu,
        total_dia           = EXCLUDED.total_dia,
        code                = EXCLUDED.code
    `;

    const res = await client.query(insertQuery, values);
    console.log("Inserted/Updated rows:", res.rowCount);

    await client.query("COMMIT");
    return rows.length;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SYNC GRPO BULK ERROR:", err);
    throw err;
  } finally {
    client.release();
  }
};
