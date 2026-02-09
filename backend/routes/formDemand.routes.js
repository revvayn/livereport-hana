// routes/formDemand.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/formDemand.controller"); // Pastikan path controller benar

router.get("/", controller.getAllDemands);
router.get("/:id/items", controller.getDemandItems); // Route baru untuk ambil list item per SO

// Jalankan proses MRP
router.post("/mrp/run", controller.runMRP);

// (Rute lainnya seperti save dan export tetap ada di sini)
router.post("/", controller.saveDemand);
router.post("/export-excel", controller.exportToExcel);
router.get("/from-so/:id", controller.getDemandFromSalesOrder);

module.exports = router;