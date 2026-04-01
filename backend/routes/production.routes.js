const express = require("express");
const router = express.Router();
const productionController = require("../controllers/production.controller");

/**
 * ==========================================
 * ROUTE DENGAN STRING STATIS (TARUH DI ATAS)
 * ==========================================
 */

// Route Utama List SO
router.get("/", productionController.getDemands); 

// Route All Schedules (Tanpa Parameter ID)
router.get("/all/schedule", productionController.getAllProductionSchedules);
router.get("/finishing-all", productionController.getAllFinishingSchedules);
router.get("/assembly-all", productionController.getAllAssemblySchedules); // Sesuaikan ini

/**
 * ==========================================
 * ROUTE DENGAN PARAMETER ID (TARUH DI BAWAH)
 * ==========================================
 */

// Full Schedule Gabungan (Packing, Finishing, Assembly) berdasarkan SO ID
// Pastikan di Controller fungsi ini sudah di-export!
router.get("/full-schedule/:id", productionController.getFullScheduleBySO);

// Detail Per Item (Packing)
router.get("/item/:itemId/schedule", productionController.getProductionSchedule);

// Detail Per Item (Finishing)
router.get("/finishing/:itemId", productionController.getFinishingSchedule);

// Detail Per Item (Assembly)
router.get("/assembly/:itemId", productionController.getAssemblySchedule);

module.exports = router;