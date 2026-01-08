const pool = require("../db/index");

async function insertDataToPostgres(table, data) {
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]);
  const values = data.map(Object.values);

  const placeholders = values
    .map(
      (row, i) =>
        `(${row.map((_, j) => `$${i * row.length + j + 1}`).join(",")})`
    )
    .join(",");

  const query = `INSERT INTO ${table} (${keys.join(",")}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;

  const flatValues = values.flat();

  try {
    await pool.query(query, flatValues);
    console.log(`${data.length} rows inserted into ${table}`);
  } catch (err) {
    console.error("Postgres insert error:", err);
    throw err;
  }
}

module.exports = { insertDataToPostgres };
