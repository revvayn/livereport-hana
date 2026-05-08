const express = require("express");
const router = express.Router();
const mrpController = require("../controllers/mrp.controller");

// Endpoint untuk melihat MRP secara realtime berdasarkan Demand ID
router.get("/calculate/:demandId", mrpController.getMrpCalculation);
router.get("/calculate-full/:id", mrpController.calculateFullRoutingBOM);
module.exports = router;