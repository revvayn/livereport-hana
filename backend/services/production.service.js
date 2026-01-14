const pool = require("../db");

/**
 * Bulk UPSERT production_reports
 * Hapus semua data lama sesuai range tanggal sebelum insert
 * @param {Array} rows - Array data produksi
 * @param {String} fromDate - tanggal awal (YYYY-MM-DD)
 * @param {String} toDate - tanggal akhir (YYYY-MM-DD)
 * @returns {Number} jumlah record yang berhasil disimpan
 */
exports.syncProductionReportsBulk = async (rows, fromDate, toDate) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- HAPUS DATA LAMA ---
    console.log(`Deleting rows from: ${fromDate} to: ${toDate}`);
    const deleteQuery = `
      DELETE FROM production_reports
      WHERE doc_date::date >= $1::date
        AND doc_date::date <= $2::date
    `;
    const deleteResult = await client.query(deleteQuery, [fromDate, toDate]);
    console.log("Deleted rows:", deleteResult.rowCount);

    // Jika tidak ada data baru, commit saja
    if (!rows || rows.length === 0) {
      await client.query("COMMIT");
      return 0;
    }

    // --- PREPARE INSERT ---
    const now = new Date();
    const values = [];

    const placeholders = rows.map((r, i) => {
      const base = i * 34;
      values.push(
        r.production_no,
        r.status_po,
        r.sales_order_no,
        r.buyer_code,
        r.buyer_name,
        r.status_so,
        r.so_cancel,
        r.checkin_no,
        r.checkout_no,
        r.doc_date,       // tetap string YYYY-MM-DD atau timestamp valid
        r.bulan,
        r.shift,
        r.operator_name,
        r.koordinator,
        r.no_proses,
        r.workcenter,
        r.kategori,
        r.item_code,
        r.item_description,
        r.vol_per_pcs,
        r.mesin,
        r.route,
        r.workcenter2,
        r.status_check_out,
        r.input_pcs,
        r.input_volume,
        r.output_pcs,
        r.output_volume,
        r.valid_qty_pcs,
        r.valid_qty,
        r.reject_pcs,
        r.reject_volume,
        r.unit_mesin,
        now
      );

      const group = Array.from({ length: 34 }, (_, k) => `$${base + k + 1}`);
      return `(${group.join(",")})`;
    });

    const insertQuery = `
      INSERT INTO production_reports (
        production_no, status_po, sales_order_no, buyer_code, buyer_name,
        status_so, so_cancel, checkin_no, checkout_no, doc_date,
        bulan, shift, operator_name, koordinator, no_proses,
        workcenter, kategori, item_code, item_description, vol_per_pcs,
        mesin, route, workcenter2, status_check_out,
        input_pcs, input_volume, output_pcs, output_volume,
        valid_qty_pcs, valid_qty, reject_pcs, reject_volume,
        unit_mesin, created_at
      ) VALUES ${placeholders.join(",")}
      ON CONFLICT (doc_date, production_no, sales_order_no, item_code, mesin)
      DO UPDATE SET
        status_po        = EXCLUDED.status_po,
        status_so        = EXCLUDED.status_so,
        so_cancel        = EXCLUDED.so_cancel,
        checkin_no       = EXCLUDED.checkin_no,
        checkout_no      = EXCLUDED.checkout_no,
        workcenter       = EXCLUDED.workcenter,
        item_description = EXCLUDED.item_description,
        route            = EXCLUDED.route,
        workcenter2      = EXCLUDED.workcenter2,
        input_pcs        = EXCLUDED.input_pcs,
        input_volume     = EXCLUDED.input_volume,
        output_pcs       = EXCLUDED.output_pcs,
        output_volume    = EXCLUDED.output_volume,
        valid_qty_pcs    = EXCLUDED.valid_qty_pcs,
        valid_qty        = EXCLUDED.valid_qty,
        reject_pcs       = EXCLUDED.reject_pcs,
        reject_volume    = EXCLUDED.reject_volume,
        status_check_out = EXCLUDED.status_check_out
    `;

    const insertResult = await client.query(insertQuery, values);
    console.log("Inserted/Updated rows:", insertResult.rowCount);

    await client.query("COMMIT");
    return rows.length;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SYNC PRODUCTION BULK ERROR:", err);
    throw err;
  } finally {
    client.release();
  }
};
