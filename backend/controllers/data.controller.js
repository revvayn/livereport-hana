const pool = require("../db");
const { getDummyProduction } = require("../services/dummyProduction.service");
const { syncProductionReportsBulk } = require("../services/production.service");

/* ================= SYNC DATA (POST) ================= */
exports.syncData = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate)
      return res.status(400).json({
        success: false,
        message: "fromDate dan toDate wajib diisi",
      });

    // Ambil semua data dari sumber (dummy / SAP)
    const rows = await getDummyProduction(fromDate, toDate);
    if (!rows.length)
      return res.json({
        success: true,
        message: "Tidak ada data untuk disync",
        total: 0,
      });

    // Filter rows sesuai range tanggal (menghindari data di luar range)
    const filteredRows = rows.filter((r) => {
      const d = new Date(r.doc_date);
      const start = new Date(fromDate);
      const end = new Date(toDate);

      // Set jam untuk start = 00:00:00 dan end = 23:59:59 agar seluruh tanggal tercover
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return d >= start && d <= end;
    });

    // Bulk UPSERT + DELETE data lama sesuai range tanggal
    const total = await syncProductionReportsBulk(filteredRows, fromDate, toDate);

    res.json({
      success: true,
      message: "Sync berhasil",
      total,
    });
  } catch (err) {
    console.error("SYNC ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat sync data",
      detail: err.message,
    });
  }
};

/* ================= GET DATA SYNC (GET) ================= */
exports.getDataSync = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (search) {
      // Gunakan kurung untuk memastikan OR benar
      whereClause = `WHERE (production_no ILIKE $1 OR buyer_name ILIKE $1 OR item_description ILIKE $1)`;
      params.push(`%${search}%`);
    }

    // Query data dengan pagination
    const dataQuery = `
      SELECT
        id,
        production_no,
        status_po,
        sales_order_no,
        buyer_code,
        buyer_name,
        status_so,
        so_cancel,
        checkin_no,
        checkout_no,
        doc_date,
        bulan,
        shift,
        operator_name,
        koordinator,
        no_proses,
        workcenter,
        kategori,
        item_code,
        item_description,
        vol_per_pcs,
        mesin,
        route,
        workcenter2,
        status_check_out,
        input_pcs,
        input_volume,
        output_pcs,
        output_volume,
        valid_qty_pcs,
        valid_qty,
        reject_pcs,
        reject_volume,
        unit_mesin,
        created_at
      FROM production_reports
      ${whereClause}
      ORDER BY doc_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const dataResult = await pool.query(dataQuery, params);

    // Hitung total data untuk pagination
    const countQuery = `SELECT COUNT(*) FROM production_reports ${whereClause}`;
    const countResult = await pool.query(countQuery, params.slice(0, params.length - 2));

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        totalPage: Math.ceil(countResult.rows[0].count / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("GET DATA SYNC ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      detail: err.message,
    });
  }
};
