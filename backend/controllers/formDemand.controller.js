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
    worksheet.addRow([]); 

    if (!items || items.length === 0) {
      return res.status(400).send("No items to export");
    }

    // 2. GENERATE HEADER TABEL (DOUBLE HEADER)
    const firstHeader = ["Item Code", "Total Qty"];
    const secondHeader = ["", ""];
    
    // Gunakan item pertama sebagai referensi tanggal
    const refCalendar = items[0].calendar || [];

    refCalendar.forEach(day => {
      const d = new Date(day.date);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      
      // Baris 1: Tanggal (Akan di merge nanti)
      firstHeader.push(dateStr, "", ""); 
      // Baris 2: Shift
      secondHeader.push("S1", "S2", "S3");
    });

    const row1 = worksheet.addRow(firstHeader);
    const row2 = worksheet.addRow(secondHeader);

    // Styling & Merging Headers
    worksheet.mergeCells('A8:A9'); // Merge Item Code
    worksheet.mergeCells('B8:B9'); // Merge Total Qty

    let colIndex = 3;
    refCalendar.forEach(() => {
      // Merge sel tanggal untuk menaungi 3 kolom shift (S1, S2, S3)
      worksheet.mergeCells(8, colIndex, 8, colIndex + 2);
      colIndex += 3;
    });

    [row1, row2].forEach(row => {
      row.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // 3. LOGIK PENYUSUNAN DATA PER SHIFT
    items.forEach(item => {
      const rowData = [item.itemCode, Number(item.qty) || 0];

      item.calendar.forEach(day => {
        // Ambil Qty masing-masing shift jika active, jika tidak tampilkan "-"
        rowData.push(day.shifts?.shift1?.active ? (Number(day.shifts.shift1.qty) || 0) : "-");
        rowData.push(day.shifts?.shift2?.active ? (Number(day.shifts.shift2.qty) || 0) : "-");
        rowData.push(day.shifts?.shift3?.active ? (Number(day.shifts.shift3.qty) || 0) : "-");
      });

      const row = worksheet.addRow(rowData);
      
      row.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center' };
        
        // Beri warna hijau (Emerald) jika cell berisi angka (Shift Active)
        if (colNumber > 2 && typeof cell.value === 'number') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
      });
    });

    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 12;

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