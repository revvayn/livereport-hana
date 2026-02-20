const express = require("express");
const router = express.Router();
const plannedOrderController = require("../controllers/plannedOrder.controller");

// Ambil list semua demand
router.get("/", plannedOrderController.getAllOrders);

// Ambil data matrix/schedule berdasarkan demand_id
router.get("/schedule/:demand_id", plannedOrderController.getScheduleByDemand);

// PERBAIKAN: Ubah /auto-generate-so menjadi /generate-schedule agar sesuai dengan Frontend
router.post("/generate-schedule", plannedOrderController.autoGenerateSOSchedule);

// Plotting manual (Add/Delete)
router.post("/toggle-plot", plannedOrderController.toggleManualPlot);

module.exports = router;