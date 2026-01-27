const express = require("express");
const router = express.Router();
const asalLogController = require("../controllers/BBAsalLog.controller");

router.get("/dashboard", asalLogController.getAsalLogDashboard);

module.exports = router;
