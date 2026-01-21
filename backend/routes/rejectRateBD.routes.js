const express = require("express");
const router = express.Router();
const controller = require("../controllers/rejectRateBlowdetector.controller");

router.get("/blow-detector", controller.getRejectRateBlowdetector);

module.exports = router;
