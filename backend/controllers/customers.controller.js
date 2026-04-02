const pool = require("../db");
const xlsx = require("xlsx");

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

exports.getCustomers = async (req, res) => {
  // Ambil parameter 'search' dari URL query (misal: /customers?search=abc)
  const { search } = req.query;

  try {
    let result;
    
    if (search) {
      // Jika ada pencarian, gunakan ILIKE (Case Insensitive)
      // Kita mencari kecocokan pada kode ATAU nama customer
      const searchQuery = `
        SELECT * FROM customers 
        WHERE customer_code ILIKE $1 
        OR customer_name ILIKE $1 
        ORDER BY customer_name ASC
      `;
      const values = [`%${search}%`]; // Menambahkan wildcard % agar mencari teks di tengah
      result = await pool.query(searchQuery, values);
    } else {
      // Jika tidak ada pencarian, tampilkan semua seperti biasa
      result = await pool.query("SELECT * FROM customers ORDER BY id DESC");
    }

    res.json(result.rows || []);
  } catch (err) {
    console.error("Error getCustomers:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

exports.importExcelCustomers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) return res.status(400).json({ error: "File kosong" });

    await pool.query("BEGIN");

    for (const row of data) {
      const { customer_code, customer_name } = row;
      if (!customer_code || !customer_name) continue;

      const query = `
        INSERT INTO customers (customer_code, customer_name)
        VALUES ($1, $2)
        ON CONFLICT (customer_code) 
        DO UPDATE SET customer_name = EXCLUDED.customer_name
      `;
      await pool.query(query, [customer_code, customer_name]);
    }

    await pool.query("COMMIT");
    res.json({ message: `${data.length} data customer berhasil diproses` });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Gagal import data customer" });
  }
};