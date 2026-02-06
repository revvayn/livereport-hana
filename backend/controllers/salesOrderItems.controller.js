const pool = require("../db");

// 1. Ambil SEMUA item dari semua SO (untuk list utama)
exports.getAllSalesOrderItems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT soi.id, so.so_number, i.item_code, i.description, soi.quantity
            FROM sales_order_items soi
            JOIN sales_orders so ON so.id = soi.sales_order_id
            JOIN items i ON i.id = soi.item_id
            ORDER BY soi.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data items" });
    }
};

// 2. Ambil item berdasarkan ID Sales Order tertentu
// controllers/salesOrderItems.controller.js
exports.getItemsBySalesOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                soi.id, 
                soi.quantity,  -- Ini akan terbaca string jika desimal
                soi.item_id, 
                i.item_code, 
                i.description
            FROM sales_order_items soi
            INNER JOIN items i ON i.id = soi.item_id 
            WHERE soi.sales_order_id = $1
            ORDER BY soi.id ASC`, 
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error saat mengambil items" });
    }
};

// 3. Tambah Item ke SO (Logika: Jika item sama sudah ada, maka update quantity)
exports.createItem = async (req, res) => {
    const { sales_order_id, item_id, quantity } = req.body;
    if (!sales_order_id || !item_id || !quantity) return res.status(400).json({ error: "Data tidak lengkap" });

    try {
        // Cek duplikasi item dalam satu SO
        const check = await pool.query(
            "SELECT id, quantity FROM sales_order_items WHERE sales_order_id=$1 AND item_id=$2",
            [sales_order_id, item_id]
        );

        if (check.rows.length > 0) {
            const newQty = parseInt(check.rows[0].quantity) + parseInt(quantity);
            const update = await pool.query(
                "UPDATE sales_order_items SET quantity=$1 WHERE id=$2 RETURNING *",
                [newQty, check.rows[0].id]
            );
            return res.json(update.rows[0]);
        }

        const result = await pool.query(
            "INSERT INTO sales_order_items (sales_order_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *",
            [sales_order_id, item_id, quantity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal menambah item" });
    }
};

// 4. Update Item
exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { item_id, quantity } = req.body;
    try {
        const result = await pool.query(
            "UPDATE sales_order_items SET item_id=$1, quantity=$2 WHERE id=$3 RETURNING *",
            [item_id, quantity, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Data tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Gagal update item" });
    }
};

// 5. Delete Item
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