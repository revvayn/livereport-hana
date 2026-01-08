const { getDataFromHana } = require("../services/hanaService");
const { insertDataToPostgres } = require("../services/postgresService");

async function syncData(req, res) {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "fromDate dan toDate wajib diisi" });
    }

    // Contoh query HANA dengan filter tanggal
    const query = `
      SELECT *
      FROM MY_HANA_TABLE
      WHERE "DATE_COLUMN" BETWEEN ? AND ?
    `;

    // getDataFromHana bisa menerima parameter untuk mencegah SQL injection
    const data = await getDataFromHana(query, [fromDate, toDate]);

    await insertDataToPostgres("my_postgres_table", data);

    res.json({ message: "Data sync berhasil", rows: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Data sync gagal", error: err.message });
  }
}

module.exports = { syncData };
