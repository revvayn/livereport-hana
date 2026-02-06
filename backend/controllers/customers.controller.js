const pool = require("../db");

// GET all customers
exports.getCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers ORDER BY id");
    res.json(result.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// GET customer by ID
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// CREATE customer
exports.createCustomer = async (req, res) => {
    console.log("Create Customer body:", req.body); // ← lihat apa yang dikirim frontend
    const { customer_code, customer_name } = req.body;
  
    if (!customer_code || !customer_name) {
      return res.status(400).json({ error: "Customer code and name are required" });
    }
  
    try {
      const result = await pool.query(
        "INSERT INTO customers(customer_code, customer_name) VALUES($1, $2) RETURNING *",
        [customer_code, customer_name]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create customer" });
    }
  };
  

// UPDATE customer
exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { customer_code, customer_name } = req.body;
  if (!customer_code || !customer_name) {
    return res.status(400).json({ error: "Customer code and name are required" });
  }
  try {
    const result = await pool.query(
      "UPDATE customers SET customer_code=$1, customer_name=$2 WHERE id=$3 RETURNING *",
      [customer_code, customer_name, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

// DELETE customer
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM customers WHERE id=$1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};
