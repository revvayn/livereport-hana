const express = require("express");
const router = express.Router();
const productionController = require("../controllers/production.controller");

// 1. Letakkan yang 'all' di atas
router.get("/all/schedule", productionController.getAllProductionSchedules);

// 2. Baru yang menggunakan ID di bawahnya
router.get("/:itemId/schedule", productionController.getProductionSchedule);

module.exports = router;