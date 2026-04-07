const express = require("express");
const router = express.Router();
const productionController = require("../controllers/production.controller");

// Holiday Routes
router.get("/holidays", productionController.getHolidays);
router.post("/holidays", productionController.addHoliday);
router.delete("/holidays/:id", productionController.deleteHoliday);

// Schedule Routes
router.get("/all/schedule", productionController.getAllProductionSchedules);
router.get("/finishing-all", productionController.getAllFinishingSchedules);
router.get("/assembly-all", productionController.getAllAssemblySchedules);

module.exports = router;