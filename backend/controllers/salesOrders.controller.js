const pool = require("../db");

// ==========================================
// --- SALES ORDER CONTROLLER (HEADER) ---
// ==========================================

// GET all sales orders
exports.getSalesOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT so.id, so.so_number, so.so_date, so.delivery_date, so.status,
             c.id as customer_id, c.customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      ORDER BY so.so_date DESC
    `);
    res.json(result.rows || []);
  } catch (err) {
    console.error("Fetch SO Error:", err);
    res.status(500).json({ error: "Gagal mengambil daftar sales order" });
  }
};

// GET single sales order
exports.getSalesOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT so.*, c.customer_name 
      FROM sales_orders so 
      LEFT JOIN customers c ON so.customer_id = c.id 
      WHERE so.id=$1`, [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Sales order tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data sales order" });
  }
};

// CREATE sales order
exports.createSalesOrder = async (req, res) => {
  const { so_number, so_date, customer_id, delivery_date, status } = req.body;
  if (!so_number || !so_date || !customer_id) {
    return res.status(400).json({ error: "Nomor SO, Tanggal, dan Customer wajib diisi" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO sales_orders(so_number, so_date, customer_id, delivery_date, status)
       VALUES($1, $2, $3, $4, $5) RETURNING *`,
      [so_number, so_date, customer_id, delivery_date || null, status || "OPEN"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create SO Error:", err);
    res.status(500).json({ error: "Gagal membuat sales order" });
  }
};

// UPDATE sales order
exports.updateSalesOrder = async (req, res) => {
  const { id } = req.params;
  const { so_number, so_date, customer_id, delivery_date, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE sales_orders 
       SET so_number=$1, so_date=$2, customer_id=$3, delivery_date=$4, status=$5
       WHERE id=$6 RETURNING *`,
      [so_number, so_date, customer_id, delivery_date || null, status, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Sales order tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui sales order" });
  }
};

// DELETE sales order
exports.deleteSalesOrder = async (req, res) => {
  const { id } = req.params;
  try {
    // Catatan: Pastikan di database menggunakan ON DELETE CASCADE atau hapus item detail dulu
    await pool.query("DELETE FROM sales_order_items WHERE sales_order_id=$1", [id]);
    const result = await pool.query("DELETE FROM sales_orders WHERE id=$1 RETURNING *", [id]);
    
    if (!result.rows.length) return res.status(404).json({ error: "Sales order tidak ditemukan" });
    res.json({ message: "Sales order dan item terkait berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus sales order" });
  }
};

// ==========================================
// --- DETAIL ITEMS CONTROLLER ---
// ==========================================

// Master Item dengan Ratio BOM
exports.getMasterItemsWithRatio = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
          i.id, i.item_code, i.description, 
          MAX(COALESCE(b.quantity, 0) / NULLIF(COALESCE(b.qtypcs_item, 0), 0)) as ratio_bom
      FROM items i
      LEFT JOIN bill_of_materials b ON i.item_code = b.product_item
      GROUP BY i.id, i.item_code, i.description
      ORDER BY i.item_code ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil master item" });
  }
};

// List Item per SO
exports.getItemsBySalesOrder = async (req, res) => {
  const { id } = req.params; // ID Sales Order
  try {
    const result = await pool.query(`
      SELECT soi.*, i.item_code, i.description
      FROM sales_order_items soi
      JOIN items i ON i.id = soi.item_id 
      WHERE soi.sales_order_id = $1
      ORDER BY soi.id ASC`, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil rincian item" });
  }
};

// Tambah Item ke SO
exports.createItem = async (req, res) => {
  const { sales_order_id, item_id, quantity, pcs } = req.body;
  try {
    // Opsional: Cek dulu apakah status SO masih OPEN
    const soStatus = await pool.query("SELECT status FROM sales_orders WHERE id=$1", [sales_order_id]);
    if (soStatus.rows[0]?.status === 'CLOSED') {
        return res.status(400).json({ error: "Tidak dapat menambah item pada SO yang sudah CLOSED" });
    }

    const result = await pool.query(
      "INSERT INTO sales_order_items (sales_order_id, item_id, quantity, pcs) VALUES ($1, $2, $3, $4) RETURNING *",
      [sales_order_id, item_id, quantity, pcs]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal menambahkan item" });
  }
};

// Update Item
exports.updateItem = async (req, res) => {
  const { id } = req.params; // ID Detail Item
  const { item_id, quantity, pcs } = req.body;
  try {
    const result = await pool.query(
      "UPDATE sales_order_items SET item_id=$1, quantity=$2, pcs=$3 WHERE id=$4 RETURNING *",
      [item_id, quantity, pcs, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui item" });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM sales_order_items WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json({ message: "Item berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus item" });
  }
};