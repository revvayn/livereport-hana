const pool = require("../db");
const XLSX = require("xlsx");

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

const parseExcelDate = (dateVal) => {
  if (!dateVal) return null;
  
  // Jika input adalah objek Date asli (karena cellDates: true)
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split('T')[0];
  }

  // Jika input adalah angka serial Excel (misal: 45397)
  if (typeof dateVal === 'number') {
    const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  // Jika input sudah string, coba bersihkan atau kembalikan apa adanya
  return dateVal;
};

exports.importExcel = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    // Membaca workbook dengan opsi cellDates agar tanggal tidak jadi angka serial jika memungkinkan
    const workbook = XLSX.read(req.file.buffer, { 
      type: "buffer",
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    const sheetName = workbook.SheetNames[0];
    // raw: false dikombinasikan dengan dateNF membantu menstandarkan output
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    await client.query("BEGIN");

    for (const row of data) {
      const { 
        so_number, 
        so_date, 
        customer_code, 
        delivery_date, 
        status, 
        item_code, 
        pcs 
      } = row;

      // Skip jika data kritikal kosong
      if (!so_number || !item_code) continue;

      // 1. Konversi Tanggal (PENTING: Menghindari error invalid syntax date)
      const formattedSoDate = parseExcelDate(so_date) || new Date().toISOString().split('T')[0];
      const formattedDelivDate = parseExcelDate(delivery_date);

      // 2. Cari customer_id berdasarkan customer_code
      const custRes = await client.query("SELECT id FROM customers WHERE customer_code = $1", [customer_code]);
      const customer_id = custRes.rows[0]?.id;

      if (!customer_id) {
        console.warn(`Skip baris: Customer ${customer_code} tidak ditemukan`);
        continue;
      }

      // 3. Upsert Header Sales Order
      const soRes = await client.query(
        `INSERT INTO sales_orders (so_number, so_date, customer_id, delivery_date, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (so_number) 
         DO UPDATE SET 
            so_date = EXCLUDED.so_date, 
            customer_id = EXCLUDED.customer_id,
            delivery_date = EXCLUDED.delivery_date,
            status = EXCLUDED.status
         RETURNING id`,
        [so_number, formattedSoDate, customer_id, formattedDelivDate, status || "OPEN"]
      );
      const sales_order_id = soRes.rows[0].id;

      // 4. Cari Item ID dan Hitung Ratio BOM (Konversi ke m3)
      const itemRes = await client.query(`
        SELECT i.id, 
               MAX(COALESCE(b.quantity, 0) / NULLIF(COALESCE(b.qtypcs_item, 0), 0)) as ratio
        FROM items i
        LEFT JOIN bill_of_materials b ON i.item_code = b.product_item
        WHERE i.item_code = $1
        GROUP BY i.id`, 
        [item_code]
      );

      if (itemRes.rows.length > 0) {
        const item_id = itemRes.rows[0].id;
        const ratio = parseFloat(itemRes.rows[0].ratio) || 0;
        const quantity_m3 = parseFloat((pcs * ratio).toFixed(6));

        // 5. Masukkan ke Detail Items
        // Kita gunakan DELETE + INSERT atau abaikan jika sudah ada (tergantung kebutuhan)
        // Di sini kita masukkan saja sebagai baris baru
        await client.query(
          `INSERT INTO sales_order_items (sales_order_id, item_id, pcs, quantity)
           VALUES ($1, $2, $3, $4)`,
          [sales_order_id, item_id, pcs, quantity_m3]
        );
      } else {
        console.warn(`Skip item: Kode barang ${item_code} tidak ditemukan`);
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Import SO dan Detail Item berhasil diproses" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Import Error Detail:", err);
    res.status(500).json({ error: "Gagal import: " + err.message });
  } finally {
    client.release();
  }
};