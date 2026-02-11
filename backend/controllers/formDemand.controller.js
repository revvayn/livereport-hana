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
                c.customer_name, -- PERBAIKAN: Dari c.name menjadi c.customer_name
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
             WHERE soi.sales_order_id = $1`,
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
        const firstHeader = ["Item Code", "Description", "UoM", "Qty (m3)", "Pcs"]; // Header diubah
        const secondHeader = ["", "", "", "", ""];

        // Cek sumber kalender (dari frontend 'calendar' atau DB 'production_schedule')
        const refCalendar = items[0].calendar ||
            (typeof items[0].production_schedule === 'string'
                ? JSON.parse(items[0].production_schedule)
                : items[0].production_schedule);

        refCalendar.forEach(day => {
            const dateStr = new Date(day.date).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit' });
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
                Number(item.qty || item.total_qty || 0),
                Number(item.pcs || 0) // Menggunakan nilai pcs
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