// backend/routes/bomCalculation.routes.js
const express = require("express");
const router = express.Router();
const demandController = require("../controllers/bomCalculation.controller");

// Pastikan endpoint ini ada untuk melayani handleShowDetail di frontend
router.get("/:id/items", demandController.getDemandItems); //
router.get("/:id/bom-calc", demandController.calculateDemandBOM); //

module.exports = router;