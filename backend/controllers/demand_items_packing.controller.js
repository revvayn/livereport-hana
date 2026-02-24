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
  d.so_number,
  d.so_date,
  d.customer_name,
  d.delivery_date,
  d.production_date,
  d.is_generated,
  d.is_assembly_generated,
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
        const borderStyle = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

        // --- 1. HEADER INFO (SO Number, Customer, dll) ---
        worksheet.mergeCells('A1:E1');
        const title = worksheet.getCell('A1');
        title.value = "DEMAND PRODUCTION PLAN";
        title.font = { size: 16, bold: true, color: { argb: 'FF4F46E5' } };

        const info = [
            ["SO Number", ": " + (header.soNo || "-")],
            ["SO Date", ": " + (header.soDate || "-")],
            ["Customer", ": " + (header.customer || "-")],
            ["Delivery Date", ": " + (header.deliveryDate || "-")],
            ["Production Date", ": " + (header.productionDate || "-")]
        ];
        info.forEach(item => worksheet.addRow(item).getCell(1).font = { bold: true });
        worksheet.addRow([]); // Spacer

        // --- 2. HEADER TABEL (Tanggal & Shift) ---
        const headerRowIndex = worksheet.lastRow.number + 1;
        const firstHeader = ["Item Code", "Description", "UoM", "Qty", "Pcs"];
        const secondHeader = ["", "", "", "", ""];
        const refCal = items[0].calendar;

        refCal.forEach(day => {
            const d = new Date(day.date).toLocaleDateString("id-ID", {day:'2-digit', month:'short'});
            firstHeader.push(d, "", "");
            secondHeader.push("S1", "S2", "S3");
        });

        const r1 = worksheet.addRow(firstHeader);
        const r2 = worksheet.addRow(secondHeader);

        // Styling Header Tabel (Biru)
        ['A','B','C','D','E'].forEach(col => worksheet.mergeCells(`${col}${headerRowIndex}:${col}${headerRowIndex+1}`));
        let colStart = 6;
        refCal.forEach(() => {
            worksheet.mergeCells(headerRowIndex, colStart, headerRowIndex, colStart + 2);
            colStart += 3;
        });

        [r1, r2].forEach(row => row.eachCell(cell => {
            cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF4F46E5'} };
            cell.font = { color:{argb:'FFFFFFFF'}, bold:true };
            cell.alignment = { horizontal:'center', vertical:'middle' };
            cell.border = borderStyle;
        }));

        // --- 3. DATA ROWS & PEWARNAAN MUNDUR ---
        items.forEach(item => {
            // Target Qty yang harus dicapai
            const targetPcs = parseFloat(item.pcs || 0);
            
            const rowData = [item.itemCode, item.description, item.uom, item.qty, item.pcs];
            const cellTypes = [null, null, null, null, null]; // Simpan tipe untuk warna sel

            // Ambil semua shift secara linear
            item.calendar.forEach(day => {
                ["shift1", "shift2", "shift3"].forEach(s => {
                    const shift = day.shifts[s];
                    if (shift?.active && shift.qty > 0) {
                        rowData.push(shift.qty);
                        cellTypes.push(shift.type);
                    } else {
                        rowData.push("-");
                        cellTypes.push(null);
                    }
                });
            });

            const row = worksheet.addRow(rowData);
            
            // Berikan warna berdasarkan tipe yang sudah di-generate mundur di backend
            row.eachCell((cell, colNum) => {
                cell.border = borderStyle;
                cell.alignment = { horizontal: 'center' };

                if (colNum > 5) {
                    const type = cellTypes[colNum - 1];
                    if (type === "packing") {
                        cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF10B981'} }; // Hijau Emerald
                        cell.font = { color: {argb:'FFFFFFFF'}, bold: true };
                    } else if (type === "finishing") {
                        cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF7C3AED'} }; // Ungu
                        cell.font = { color: {argb:'FFFFFFFF'}, bold: true };
                    } else if (type === "assembly") {
                        cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FFA3E635'} }; // Lime (Kuning-Hijau)
                        cell.font = { color: {argb:'FF000000'}, bold: true }; // Teks hitam agar jelas
                    }
                }
            });
        });

        // --- 4. KETERANGAN WARNA (LEGEND) ---
        worksheet.addRow([]);
        const legendStart = worksheet.lastRow.number + 1;
        worksheet.getCell(`B${legendStart}`).value = "KETERANGAN WARNA:";
        worksheet.getCell(`B${legendStart}`).font = { bold: true };

        const legends = [
            { label: "PACKING", bg: "FF10B981", text: "FFFFFFFF" },
            { label: "FINISHING", bg: "FF7C3AED", text: "FFFFFFFF" },
            { label: "ASSEMBLY", bg: "FFA3E635", text: "FF000000" }
        ];

        legends.forEach((leg, idx) => {
            const cell = worksheet.getCell(`B${legendStart + 1 + idx}`);
            cell.value = leg.label;
            cell.fill = { type:'pattern', pattern:'solid', fgColor:{argb: leg.bg} };
            cell.font = { color:{argb: leg.text}, bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.border = borderStyle;
        });

        // Pengaturan Lebar Kolom
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 40;

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=Production_Plan_${header.soNo}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) { res.status(500).send("Export Gagal"); }
};

/**
 * 7. RUN MRP
 */
exports.runMRP = async (req, res) => {
    const { demand_item_id } = req.body;
    res.json({ message: `Item ID ${demand_item_id} diproses oleh sistem MRP!` });
};

exports.updateFinishing = async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const item of items) {
            // Update hanya bagian production_schedule
            await client.query(
                `UPDATE demand_items 
                 SET production_schedule = $1 
                 WHERE demand_id = $2 AND id = $3`,
                [JSON.stringify(item.calendar), id, item.itemId]
            );
        }

        await client.query("COMMIT");
        res.json({ message: "Jadwal berhasil diperbarui" });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("UPDATE ERROR:", err.message);
        res.status(500).json({ error: "Gagal update: " + err.message });
    } finally {
        client.release();
    }
};

exports.updateDemand = async (req, res) => {
    const { id } = req.params;
    const { header, items } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Update header
        await client.query(
            `UPDATE demands 
             SET delivery_date = $1,
                 production_date = $2,
                 so_date = $3,
                 customer_name = $4
             WHERE id = $5`,
            [
                header.deliveryDate,
                header.productionDate,
                header.soDate,
                header.customer,
                id
            ]
        );

        // Hapus item lama
        await client.query(
            "DELETE FROM demand_items WHERE demand_id = $1",
            [id]
        );

        // Insert ulang item (lebih aman)
        for (const item of items) {
            await client.query(
                `INSERT INTO demand_items
                (demand_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [
                    id,
                    item.itemId,
                    item.itemCode,
                    item.description,
                    item.uom,
                    parseFloat(item.qty) || 0,
                    parseFloat(item.pcs) || 0,
                    JSON.stringify(item.calendar)
                ]
            );
        }

        await client.query("COMMIT");
        res.json({ message: "Demand updated successfully" });

    } catch (err) {
        await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};