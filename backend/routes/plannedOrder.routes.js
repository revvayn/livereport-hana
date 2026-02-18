const express = require("express");
const router = express.Router();
const plannedOrderController = require("../controllers/plannedOrder.controller"); // Pastikan path benar

// Route yang sudah ada sebelumnya
router.get("/", plannedOrderController.getAllOrders);
router.get("/schedule/:demand_id", plannedOrderController.getScheduleByDemand);
router.post("/auto-generate-so", plannedOrderController.autoGenerateSOSchedule);

// --- TAMBAHKAN BARIS INI ---
router.post("/toggle-plot", plannedOrderController.toggleManualPlot);

module.exports = router;