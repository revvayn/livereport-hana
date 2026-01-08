const { getDataFromHana } = require("../services/hanaService");
const { insertDataToPostgres } = require("../services/postgresService");

async function syncData(req, res) {
  try {
    // Contoh query HANA
    const hanaQuery = "SELECT * FROM MY_HANA_TABLE";
    const data = await getDataFromHana(hanaQuery);

    await insertDataToPostgres("my_postgres_table", data);

    res.json({ message: "Data sync successful", rows: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Data sync failed", error: err.message });
  }
}

module.exports = { syncData };
