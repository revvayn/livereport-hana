const pool = require("../db");
const ExcelJS = require("exceljs");

// 1. Ambil Data Awal dari SO (Preview)
exports.getDemandFromSalesOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const soResult = await pool.query(
            `SELECT so.id, so.so_number, so.so_date, so.delivery_date, c.customer_name
             FROM sales_orders so
             LEFT JOIN customers c ON c.id = so.customer_id
             WHERE so.id = $1`, [id]
        );
        if (!soResult.rows.length) return res.status(404).json({ error: "SO tidak ditemukan" });

        const itemsResult = await pool.query(
            `SELECT i.id as item_id, i.item_code, i.description, i.uom, soi.quantity
             FROM sales_order_items soi
             INNER JOIN items i ON i.id = soi.item_id
             WHERE soi.sales_order_id = $1`, [id]
        );

        res.json({
            header: { soNo: soResult.rows[0].so_number, customer: soResult.rows[0].customer_name },
            items: itemsResult.rows.map(row => ({ ...row, qty: Number(row.quantity) }))
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Ambil Semua List Demand
exports.getAllDemands = async (req, res) => {
    try {
        const query = `SELECT d.id as demand_id, d.so_number as reference_no, d.customer_name, COUNT(di.id) as total_items 
                       FROM demands d LEFT JOIN demand_items di ON d.id = di.demand_id 
                       GROUP BY d.id ORDER BY d.created_at DESC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: "Gagal memuat list demand" }); }
};

// 3. Ambil Item Demand (Untuk Matrix)
exports.getDemandItems = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM demand_items WHERE demand_id = $1", [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. KALKULASI BOM (Murni dari BOM, Tanpa Inventory)
exports.calculateDemandBOM = async (req, res) => {
  const { id } = req.params;
  try {
      const query = `
          WITH demand_base AS (
              SELECT 
                  di.item_code as fg_code,
                  b.linenum, 
                  b.component_code, 
                  b.component_description,
                  b.uom_component, 
                  -- Ambil ratio_component agar sesuai dengan kolom 'Ratio' di gambar Master
                  b.ratio_component as qty_ratio, 
                  -- Kalkulasi Total Required tetap menggunakan logika pembagian qty/pcs
                  ROUND(
                      (CAST(b.quantity AS NUMERIC) / NULLIF(CAST(b.qtypcs_item AS NUMERIC), 0)) 
                      * CAST(di.total_qty AS NUMERIC) 
                      / COALESCE(NULLIF(CAST(b.ratio_component AS NUMERIC), 0), 1), 
                      6) AS required_qty
              FROM demand_items di
              JOIN bill_of_materials b ON di.item_code = b.product_item
              WHERE di.demand_id = $1
          )
          SELECT * FROM demand_base 
          ORDER BY fg_code ASC, linenum ASC;
      `;

      const result = await pool.query(query, [id]);

      const grouped = result.rows.reduce((acc, row) => {
          if (!acc[row.fg_code]) acc[row.fg_code] = [];
          acc[row.fg_code].push(row);
          return acc;
      }, {});

      res.json(grouped);
  } catch (err) {
      console.error("SQL ERROR:", err.message);
      res.status(500).json({ error: "Gagal menghitung BOM: " + err.message });
  }
};;

// 5. Simpan Demand Baru
exports.saveDemand = async (req, res) => {
    const { header, items } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const dRes = await client.query(`INSERT INTO demands (so_number, customer_name) VALUES ($1, $2) RETURNING id`, [header.soNo, header.customer]);
        for (const item of items) {
            await client.query(`INSERT INTO demand_items (demand_id, item_code, total_qty, production_schedule) VALUES ($1, $2, $3, $4)`, 
            [dRes.rows[0].id, item.itemCode, item.qty, JSON.stringify(item.calendar)]);
        }
        await client.query('COMMIT');
        res.json({ message: "Saved" });
    } catch (err) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); } 
    finally { client.release(); }
};

exports.deleteDemand = async (req, res) => {
    const { id } = req.params;
    try {
        const check = await pool.query("SELECT id FROM demands WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan" });

        await pool.query("DELETE FROM demands WHERE id = $1", [id]);
        res.json({ message: "Demand berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus data" });
    }
};

/**
 * 6. EXPORT TO EXCEL
 * Membuat file excel dengan format double header (Tanggal & Shift)
 */
exports.exportToExcel = async (req, res) => {
  const { header, items } = req.body;

  try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Production Plan");

      const borderStyle = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
      };

      // 1. Header Info (Baris 1 - 7)
      worksheet.addRow(["DEMAND PRODUCTION PLAN"]).font = { size: 14, bold: true };
      worksheet.addRow(["SO Number", header.soNo || "-"]);
      worksheet.addRow(["SO Date", header.soDate ? new Date(header.soDate).toLocaleDateString("id-ID") : "-"]);
      worksheet.addRow(["Customer", header.customer || "-"]);
      worksheet.addRow(["Delivery Date", header.deliveryDate ? new Date(header.deliveryDate).toLocaleDateString("id-ID") : "-"]);
      worksheet.addRow(["Production Date", header.productionDate || "-"]);
      worksheet.addRow([]); // Baris kosong ke-7

      if (!items || items.length === 0) return res.status(400).send("No items to export");

      // 2. Tentukan Baris Mulai Tabel (Dynamic)
      const headerRowIndex = 8; 

      // 3. Double Header Logic
      const firstHeader = ["Item Code", "Description", "UoM", "Total Qty"];
      const secondHeader = ["", "", "", ""];
      
      // Cek sumber kalender (dari frontend 'calendar' atau DB 'production_schedule')
      const refCalendar = items[0].calendar || 
                         (typeof items[0].production_schedule === 'string' 
                          ? JSON.parse(items[0].production_schedule) 
                          : items[0].production_schedule);

      refCalendar.forEach(day => {
          const dateStr = new Date(day.date).toLocaleDateString("id-ID", {day:'2-digit', month:'2-digit'});
          firstHeader.push(dateStr, "", ""); 
          secondHeader.push("S1", "S2", "S3");
      });

      const row1 = worksheet.addRow(firstHeader); // Ini akan jadi baris 8
      const row2 = worksheet.addRow(secondHeader); // Ini akan jadi baris 9

      // 4. Merging Static Headers (A-D)
      ['A', 'B', 'C', 'D'].forEach(col => {
          worksheet.mergeCells(`${col}${headerRowIndex}:${col}${headerRowIndex + 1}`);
      });

      // 5. Merging Date Headers
      let colStart = 5; // Mulai dari kolom E
      refCalendar.forEach(() => {
          worksheet.mergeCells(headerRowIndex, colStart, headerRowIndex, colStart + 2);
          colStart += 3;
      });

      // Styling headers
      [row1, row2].forEach(row => {
          row.eachCell(cell => {
              cell.font = { bold: true };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
              cell.border = borderStyle;
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });
      });

      // 6. Data Rows
      items.forEach(item => {
          const cal = item.calendar || 
                      (typeof item.production_schedule === 'string' 
                       ? JSON.parse(item.production_schedule) 
                       : item.production_schedule);
          
          const rowData = [
              item.itemCode || item.item_code, 
              item.description, 
              item.uom, 
              Number(item.qty || item.total_qty)
          ];

          cal.forEach(day => {
              rowData.push(day.shifts?.shift1?.active ? day.shifts.shift1.qty : "-");
              rowData.push(day.shifts?.shift2?.active ? day.shifts.shift2.qty : "-");
              rowData.push(day.shifts?.shift3?.active ? day.shifts.shift3.qty : "-");
          });

          const row = worksheet.addRow(rowData);
          row.eachCell((cell, colNum) => {
              cell.border = borderStyle;
              cell.alignment = { horizontal: colNum <= 2 ? 'left' : 'center' };
              
              // Color Active Shifts (Emerald Green)
              if (colNum > 4 && cell.value !== "-") {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
              }
          });
      });

      // Set Column Widths
      worksheet.getColumn(1).width = 15; // Code
      worksheet.getColumn(2).width = 30; // Description
      worksheet.getColumn(3).width = 8;  // UoM
      worksheet.getColumn(4).width = 12; // Total

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=Demand_${header.soNo || 'Export'}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();

  } catch (err) {
      console.error("EXPORT EXCEL ERROR:", err);
      if (!res.headersSent) {
          res.status(500).send("Gagal ekspor ke Excel");
      }
  }
};

/**
 * 7. RUN MRP
 */
exports.runMRP = async (req, res) => {
    const { demand_item_id } = req.body;
    res.json({ message: `Item ID ${demand_item_id} diproses oleh sistem MRP!` });
};
