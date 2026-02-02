const express = require("express");
const router = express.Router();
const { getBOMCalculation } = require("../controllers/bomCalculation.controller");

// Endpoint GET BOM Calculation
router.get("/", getBOMCalculation);

module.exports = router;
