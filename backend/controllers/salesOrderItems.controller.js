const pool = require("../db");

// salesOrderItems.controller.js

exports.getMasterItemsWithRatio = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.id, 
                i.item_code, 
                i.description, 
                -- Ratio: volume dibagi jumlah pcs dari tabel BOM
                -- NULLIF digunakan untuk menghindari error 'division by zero'
                MAX(COALESCE(b.quantity, 0) / NULLIF(COALESCE(b.qtypcs_item, 0), 0)) as ratio_bom
            FROM items i
            LEFT JOIN bill_of_materials b ON i.item_code = b.product_item
            GROUP BY i.id, i.item_code, i.description
            ORDER BY i.item_code ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("SQL Error:", err);
        res.status(500).json({ error: "Gagal mengambil master item" });
    }
};

// Ambil item berdasarkan Sales Order ID
exports.getItemsBySalesOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT soi.*, i.item_code, i.description
            FROM sales_order_items soi
            JOIN items i ON i.id = soi.item_id 
            WHERE soi.sales_order_id = $1
            ORDER BY soi.id ASC`, [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil items" });
    }
};
// Endpoint: POST /api/sales-order-items
exports.createItem = async (req, res) => {
    const { sales_order_id, item_id, quantity, pcs } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO sales_order_items (sales_order_id, item_id, quantity, pcs) VALUES ($1, $2, $3, $4) RETURNING *",
            [sales_order_id, item_id, quantity, pcs]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal simpan item" });
    }
};

// Endpoint: PUT /api/sales-order-items/:id
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { item_id, quantity, pcs } = req.body;
    try {
        const result = await pool.query(
            "UPDATE sales_order_items SET item_id=$1, quantity=$2, pcs=$3 WHERE id=$4 RETURNING *",
            [item_id, quantity, pcs, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal update item" });
    }
};

// 5. Delete Item (Tetap sama)
exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM sales_order_items WHERE id=$1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json({ message: "Berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus item" });
    }
};