const pool = require("../db");
const ExcelJS = require("exceljs");
/*
 GET DEMAND PREVIEW FROM SALES ORDER
*/
exports.getDemandFromSalesOrder = async (req, res) => {
  const { id } = req.params;

  try {
    /* ================= HEADER ================= */
    const soResult = await pool.query(
      `
      SELECT 
        so.id,
        so.so_number,
        so.so_date,
        so.delivery_date,
        c.customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON c.id = so.customer_id
      WHERE so.id = $1
      `,
      [id]
    );

    if (!soResult.rows.length) {
      return res.status(404).json({ error: "Sales Order tidak ditemukan" });
    }

    const so = soResult.rows[0];

    /* ================= ITEMS ================= */
    const itemsResult = await pool.query(
      `
      SELECT 
        i.id as item_id,
        i.item_code,
        i.description,
        i.uom,
        soi.quantity
      FROM sales_order_items soi
      INNER JOIN items i ON i.id = soi.item_id
      WHERE soi.sales_order_id = $1
      ORDER BY soi.id ASC
      `,
      [id]
    );

    /* ================= BUILD RESPONSE ================= */
    const response = {
      header: {
        soNo: so.so_number,
        soDate: so.so_date,
        customer: so.customer_name,
        deliveryDate: so.delivery_date
      },
      items: itemsResult.rows.map(row => ({
        itemId: row.item_id,
        itemCode: row.item_code,
        description: row.description,
        uom: row.uom,
        qty: Number(row.quantity)
      }))
    };

    res.json(response);

  } catch (err) {
    console.error("GET DEMAND FROM SO ERROR:", err);
    res.status(500).json({ error: "Gagal generate demand dari SO" });
  }
};

exports.exportToExcel = async (req, res) => {
  const { header, items } = req.body;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Production Plan");

    // Styling Konfigurasi
    const borderStyle = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // 1. INFO HEADER SO
    worksheet.addRow(["DEMAND PRODUCTION PLAN"]).font = { size: 14, bold: true };
    worksheet.addRow(["SO Number", header.soNo || "-"]);
    worksheet.addRow(["SO Date", header.soDate || "-"]);
    worksheet.addRow(["Customer", header.customer || "-"]);
    worksheet.addRow(["Production Date", header.productionDate || "-"]);
    worksheet.addRow(["Delivery Date", header.deliveryDate || "-"]);
    worksheet.addRow([]); // Baris Kosong

    // 2. GENERATE HEADER TABEL (TANGGAL)
    if (!items || items.length === 0) {
      return res.status(400).send("No items to export");
    }

    // Ambil tanggal dari item pertama sebagai acuan kolom
    const dateHeaders = items[0].calendar.map(c => {
      const d = new Date(c.date);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    });

    const headerRowValues = ["Item Code", "Total Qty", ...dateHeaders];
    const headerRow = worksheet.addRow(headerRowValues);

    // Styling Header Row
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      cell.border = borderStyle;
      cell.alignment = { horizontal: 'center' };
    });

    // 3. LOGIK PENYUSUNAN DATA ITEM & QUANTITY
    items.forEach(item => {
      const rowData = [
        item.itemCode,
        Number(item.qty) || 0
      ];

      // Iterasi setiap hari di kalender item tersebut
      item.calendar.forEach(day => {
        let dailyTotal = 0;

        // Cek shift1, shift2, dan shift3
        if (day.shifts) {
          // Pastikan menjumlahkan HANYA jika 'active' bernilai true
          if (day.shifts.shift1?.active) dailyTotal += Number(day.shifts.shift1.qty || 0);
          if (day.shifts.shift2?.active) dailyTotal += Number(day.shifts.shift2.qty || 0);
          if (day.shifts.shift3?.active) dailyTotal += Number(day.shifts.shift3.qty || 0);
        }

        // Jika total 0, tampilkan "-" agar sesuai dengan gambar Anda, jika ada isinya tampilkan angka
        rowData.push(dailyTotal > 0 ? dailyTotal : "-");
      });

      const row = worksheet.addRow(rowData);
      
      // Styling Baris Data
      row.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        if (colNumber > 1) { // Kolom angka dibuat rata tengah
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Atur Lebar Kolom
    worksheet.getColumn(1).width = 20; // Item Code
    worksheet.getColumn(2).width = 10; // Total Qty

    // 4. KIRIM RESPONSE
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Demand_${header.soNo || 'Export'}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("EXPORT EXCEL ERROR:", err);
    res.status(500).send("Gagal membuat file Excel");
  }
};

exports.saveDemand = async (req, res) => {
  const { header, items } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Simpan ke tabel demands
    const demandRes = await client.query(
      `INSERT INTO demands (so_number, so_date, customer_name, delivery_date, production_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [header.soNo, header.soDate, header.customer, header.deliveryDate, header.productionDate]
    );

    const demandId = demandRes.rows[0].id;

    // 2. Simpan setiap item
    for (const item of items) {
      await client.query(
        `INSERT INTO demand_items (demand_id, item_id, item_code, total_qty, production_schedule) 
         VALUES ($1, $2, $3, $4, $5)`,
        [demandId, item.itemId, item.itemCode, item.qty, JSON.stringify(item.calendar)]
      );
    }

    await client.query('COMMIT');
    res.json({ message: "Demand saved successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.getAllDemands = async (req, res) => {
  try {
    // Ambil Header SO saja, tapi kita hitung jumlah item di dalamnya
    const query = `
      SELECT 
        d.id as demand_id,
        d.so_number as reference_no,
        d.so_date,
        d.customer_name,
        d.delivery_date,
        d.production_date,
        COUNT(di.id) as total_items,
        'NEW' as status
      FROM demands d
      LEFT JOIN demand_items di ON d.id = di.demand_id
      GROUP BY d.id
      ORDER BY d.created_at DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat data SO" });
  }
};

// Tambahkan fungsi untuk ambil item berdasarkan ID Demand
exports.getDemandItems = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM demand_items WHERE demand_id = $1", 
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat item" });
  }
};

// Placeholder untuk Run MRP
exports.runMRP = async (req, res) => {
  const { demand_item_id } = req.body;
  try {
    // Di sini nanti tempat logic MRP (meledakkan BOM ke Planned Order)
    res.json({ message: `Item ID ${demand_item_id} sedang diproses oleh sistem MRP!` });
  } catch (err) {
    res.status(500).json({ message: "Sistem MRP gagal memproses item ini" });
  }
};