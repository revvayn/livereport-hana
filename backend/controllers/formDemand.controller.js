const pool = require("../db");
const ExcelJS = require("exceljs");

/**
 * 1. GET DEMAND PREVIEW FROM SALES ORDER
 * Mengambil data dari modul Sales Order untuk diolah di Demand Form
 */
// Di Backend (Controller)
exports.getDemandFromSalesOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const soResult = await pool.query(
            `SELECT 
                so.so_number, 
                so.so_date, 
                c.customer_name, 
                so.delivery_date 
             FROM sales_orders so
             LEFT JOIN customers c ON so.customer_id = c.id
             WHERE so.id = $1`,
            [id]
        );

        if (soResult.rows.length === 0) {
            return res.status(404).json({ error: "Sales Order tidak ditemukan" });
        }

        const itemsResult = await pool.query(
            `SELECT 
                i.id as item_id, 
                i.item_code, 
                i.description, 
                i.uom, 
                soi.quantity, 
                soi.pcs 
             FROM sales_order_items soi
             INNER JOIN items i ON i.id = soi.item_id
             WHERE soi.sales_order_id = $1
             ORDER BY soi.id ASC`, // <--- TAMBAHKAN INI AGAR URUTAN SESUAI INPUT SO
            [id]
        );

        res.json({
            header: soResult.rows[0],
            items: itemsResult.rows
        });
    } catch (err) {
        console.error("DATABASE ERROR:", err.message);
        res.status(500).json({ error: "Gagal memproses data: " + err.message });
    }
};

/**
 * 2. SAVE DEMAND
 * Menyimpan data demand dan item (termasuk description & uom) ke database
 */
// Di controllers/formDemand.controller.js
exports.saveDemand = async (req, res) => {
    const { header, items } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const demandRes = await client.query(
            `INSERT INTO demands (so_number, so_date, customer_name, delivery_date, production_date) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [header.soNo, header.soDate, header.customer, header.deliveryDate, header.productionDate]
        );

        const demandId = demandRes.rows[0].id;

        // Di controllers/formDemand.controller.js
        for (const item of items) {
            await client.query(
                `INSERT INTO demand_items (
            demand_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    demandId,
                    item.itemId,
                    item.itemCode,
                    item.description,
                    item.uom,
                    parseFloat(item.qty) || 0, // Pastikan jadi Float/Decimal
                    parseFloat(item.pcs) || 0, // Pastikan jadi Float/Decimal
                    JSON.stringify(item.calendar)
                ]
            );
        }

        await client.query('COMMIT');
        res.json({ message: "Demand saved successfully", demandId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("SAVE ERROR:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

/**
 * 3. GET ALL DEMANDS
 * Menampilkan daftar seluruh demand untuk tabel utama
 */
exports.getAllDemands = async (req, res) => {
    try {
        const query = `
            SELECT 
                d.id as demand_id,
                d.so_number as reference_no,
                d.so_date,
                d.customer_name,
                d.delivery_date,
                d.production_date,
                COUNT(di.id) as total_items
            FROM demands d
            LEFT JOIN demand_items di ON d.id = di.demand_id
            GROUP BY d.id
            ORDER BY d.created_at DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat data Demand" });
    }
};

/**
 * 4. GET DEMAND ITEMS
 * Mengambil detail item untuk tampilan Matrix/Detail
 */
exports.getDemandItems = async (req, res) => {
    const { id } = req.params;
    try {
        // Mengambil semua kolom termasuk 'pcs'
        const result = await pool.query(
            "SELECT id, item_code, description, uom, total_qty, pcs, production_schedule FROM demand_items WHERE demand_id = $1 ORDER BY id ASC",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal memuat item detail" });
    }
};

/**
 * 5. DELETE DEMAND
 * Menghapus demand (otomatis menghapus items karena CASCADE)
 */
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

        // 1. Header Info (Styling lebih profesional)
        const titleCell = worksheet.getCell('A1');
        titleCell.value = "DEMAND PRODUCTION PLAN";
        titleCell.font = { size: 16, bold: true, color: { argb: 'FF4F46E5' } };
        
        worksheet.addRow(["SO Number", ": " + (header.soNo || "-")]);
        worksheet.addRow(["SO Date", ": " + (header.soDate ? new Date(header.soDate).toLocaleDateString("id-ID") : "-")]);
        worksheet.addRow(["Customer", ": " + (header.customer || "-")]);
        worksheet.addRow(["Delivery Date", ": " + (header.deliveryDate ? new Date(header.deliveryDate).toLocaleDateString("id-ID") : "-")]);
        worksheet.addRow(["Production Date", ": " + (header.productionDate || "-")]);
        worksheet.addRow([]); // Spacer

        if (!items || items.length === 0) return res.status(400).send("No items to export");

        // 2. Tentukan Baris Mulai Tabel
        const headerRowIndex = 8;

        // 3. Header Kolom (Ditambah kolom Pcs di E)
        const firstHeader = ["Item Code", "Description", "UoM", "Qty (m3)", "Pcs"];
        const secondHeader = ["", "", "", "", ""];

        const refCalendar = items[0].calendar ||
            (typeof items[0].production_schedule === 'string'
                ? JSON.parse(items[0].production_schedule)
                : items[0].production_schedule);

        refCalendar.forEach(day => {
            const dateStr = new Date(day.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' });
            firstHeader.push(dateStr, "", "");
            secondHeader.push("S1", "S2", "S3");
        });

        const row1 = worksheet.addRow(firstHeader);
        const row2 = worksheet.addRow(secondHeader);

        // 4. Merging Static Headers (A sampai E)
        // Karena kita nambah kolom 'Pcs', maka range merge jadi A-E
        ['A', 'B', 'C', 'D', 'E'].forEach(col => {
            worksheet.mergeCells(`${col}${headerRowIndex}:${col}${headerRowIndex + 1}`);
        });

        // 5. Merging Date Headers (Mulai dari kolom F / index 6)
        let colStart = 6; 
        refCalendar.forEach(() => {
            worksheet.mergeCells(headerRowIndex, colStart, headerRowIndex, colStart + 2);
            colStart += 3;
        });

        // Styling Headers
        [row1, row2].forEach((row, idx) => {
            row.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { 
                    type: 'pattern', 
                    pattern: 'solid', 
                    fgColor: { argb: idx === 0 ? 'FF4F46E5' : '6366F1' } // Indigo shades
                };
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
                Number(item.qty || item.total_qty || 0),
                Number(item.pcs || 0)
            ];

            cal.forEach(day => {
                rowData.push(day.shifts?.shift1?.active ? day.shifts.shift1.qty : "-");
                rowData.push(day.shifts?.shift2?.active ? day.shifts.shift2.qty : "-");
                rowData.push(day.shifts?.shift3?.active ? day.shifts.shift3.qty : "-");
            });

            const row = worksheet.addRow(rowData);
            row.eachCell((cell, colNum) => {
                cell.border = borderStyle;
                
                // Alignment spesifik
                if (colNum <= 2) cell.alignment = { horizontal: 'left' };
                else cell.alignment = { horizontal: 'center' };

                // Styling angka Pcs dan Qty
                if (colNum === 4 || colNum === 5) {
                    cell.font = { bold: true };
                    cell.numFmt = '#,##0.00';
                }

                // Highlight Active Shifts (Emerald Green)
                if (colNum > 5 && cell.value !== "-") {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Light green bg
                    cell.font = { color: { argb: 'FF065F46' }, bold: true }; // Dark green text
                }
            });
        });

        // Set Lebar Kolom agar tidak terpotong
        worksheet.getColumn(1).width = 18; // Code
        worksheet.getColumn(2).width = 35; // Description
        worksheet.getColumn(3).width = 7;  // UoM
        worksheet.getColumn(4).width = 10; // Qty
        worksheet.getColumn(5).width = 10; // Pcs

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Demand_${header.soNo || 'Export'}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("EXPORT EXCEL ERROR:", err);
        if (!res.headersSent) res.status(500).send("Gagal ekspor ke Excel");
    }
};

/**
 * 7. RUN MRP
 */
exports.runMRP = async (req, res) => {
    const { demand_item_id } = req.body;
    res.json({ message: `Item ID ${demand_item_id} diproses oleh sistem MRP!` });
};