const pool = require("../db");

/*
 GET DEMAND PREVIEW FROM SALES ORDER
*/
exports.getDemandFromSalesOrder = async (req, res) => {
  const { id } = req.params;

  try {
    /* ================= HEADER ================= */
    const soResult = await pool.query(
      `
      SELECT 
        so.id,
        so.so_number,
        so.so_date,
        so.delivery_date,
        c.customer_name
      FROM sales_orders so
      LEFT JOIN customers c ON c.id = so.customer_id
      WHERE so.id = $1
      `,
      [id]
    );

    if (!soResult.rows.length) {
      return res.status(404).json({ error: "Sales Order tidak ditemukan" });
    }

    const so = soResult.rows[0];

    /* ================= ITEMS ================= */
    const itemsResult = await pool.query(
      `
      SELECT 
        i.id as item_id,
        i.item_code,
        i.description,
        i.uom,
        soi.quantity
      FROM sales_order_items soi
      INNER JOIN items i ON i.id = soi.item_id
      WHERE soi.sales_order_id = $1
      ORDER BY soi.id ASC
      `,
      [id]
    );

    /* ================= BUILD RESPONSE ================= */
    const response = {
      header: {
        soNo: so.so_number,
        soDate: so.so_date,
        customer: so.customer_name,
        deliveryDate: so.delivery_date
      },
      items: itemsResult.rows.map(row => ({
        itemId: row.item_id,
        itemCode: row.item_code,
        description: row.description,
        uom: row.uom,
        qty: Number(row.quantity)
      }))
    };

    res.json(response);

  } catch (err) {
    console.error("GET DEMAND FROM SO ERROR:", err);
    res.status(500).json({ error: "Gagal generate demand dari SO" });
  }
};
