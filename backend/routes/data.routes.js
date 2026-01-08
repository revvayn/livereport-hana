const express = require("express");
const router = express.Router();
const { syncData } = require("../controllers/data.controller");

router.get("/sync", syncData); // trigger manual sync via GET /api/data/sync

module.exports = router;
