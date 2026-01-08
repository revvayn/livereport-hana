const { getHanaConnection } = require("../config/hana");

async function getDataFromHana(query) {
  const client = getHanaConnection();

  return new Promise((resolve, reject) => {
    client.exec(query, (err, rows) => {
      client.disconnect();
      if (err) {
        console.error("HANA query error:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
}

module.exports = { getDataFromHana };
