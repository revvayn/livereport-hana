const express = require("express");
const router = express.Router();
const productionController = require("../controllers/production.controller");

// 1. Letakkan yang 'all' di atas
router.get("/all/schedule", productionController.getAllProductionSchedules);

// 2. Baru yang menggunakan ID di bawahnya
router.get("/:itemId/schedule", productionController.getProductionSchedule);
router.get("/finishing/:itemId", productionController.getFinishingSchedule);
router.get("/finishing-all", productionController.getAllFinishingSchedules);
router.get("/assembly-schedule/all", productionController.getAllAssemblySchedules);
router.get("/assembly-schedule/:itemId", productionController.getAssemblySchedule);
module.exports = router;