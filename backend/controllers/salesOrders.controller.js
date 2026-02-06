const pool = require("../db");

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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales orders" });
  }
};

// GET single sales order
exports.getSalesOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM sales_orders WHERE id=$1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Sales order not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales order" });
  }
};

// CREATE sales order
exports.createSalesOrder = async (req, res) => {
  const { so_number, so_date, customer_id, delivery_date, status } = req.body;
  if (!so_number || !so_date || !customer_id) {
    return res.status(400).json({ error: "SO Number, SO Date, and Customer are required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO sales_orders(so_number, so_date, customer_id, delivery_date, status)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [so_number, so_date, customer_id, delivery_date || null, status || "OPEN"]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create sales order" });
  }
};

// UPDATE sales order
exports.updateSalesOrder = async (req, res) => {
  const { id } = req.params;
  const { so_number, so_date, customer_id, delivery_date, status } = req.body;
  if (!so_number || !so_date || !customer_id) {
    return res.status(400).json({ error: "SO Number, SO Date, and Customer are required" });
  }
  try {
    const result = await pool.query(
      `UPDATE sales_orders 
       SET so_number=$1, so_date=$2, customer_id=$3, delivery_date=$4, status=$5
       WHERE id=$6 RETURNING *`,
      [so_number, so_date, customer_id, delivery_date || null, status || "OPEN", id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Sales order not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update sales order" });
  }
};

// DELETE sales order
exports.deleteSalesOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM sales_orders WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Sales order not found" });
    res.json({ message: "Sales order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete sales order" });
  }
};
