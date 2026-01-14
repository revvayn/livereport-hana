const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data.controller");

// POST untuk sync data
router.post("/sync", dataController.syncData);

// GET untuk fetch data sync
router.get("/data-sync", dataController.getDataSync);

module.exports = router;
