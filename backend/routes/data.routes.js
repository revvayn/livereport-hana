const express = require("express");
const router = express.Router();
const {
  getDataSync,
  syncData
} = require("../controllers/data.controller");

router.get("/data-sync", getDataSync);
router.post("/sync", syncData);

module.exports = router;
