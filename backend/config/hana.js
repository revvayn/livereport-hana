const { Client } = require("@sap/hana-client");

const hanaConfig = {
  serverNode: process.env.HANA_SERVER || "host:port",
  uid: process.env.HANA_USER || "USERNAME",
  pwd: process.env.HANA_PASSWORD || "PASSWORD",
  encrypt: true,
};

function getHanaConnection() {
  const client = new Client(hanaConfig);
  client.connect(err => {
    if (err) {
      console.error("HANA connection error:", err);
      throw err;
    }
    console.log("Connected to SAP HANA");
  });
  return client;
}

module.exports = { getHanaConnection };
