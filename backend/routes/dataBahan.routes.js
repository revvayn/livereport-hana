const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataBahan.controller");

// POST sync GRPO
router.post("/sync", dataController.syncGrpoData);

// GET list GRPO
router.get("/bahanbaku-sync", dataController.getGrpoDataSync);

module.exports = router;
