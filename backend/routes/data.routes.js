const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data.controller");

router.post("/sync", dataController.syncData);
router.get("/data-sync", dataController.getDataSync); // ⬅️ INI YANG KURANG

module.exports = router;
