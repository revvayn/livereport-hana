const express = require("express");
const router = express.Router();
const plannedOrderController = require("../controllers/plannedOrder.controller");

// Pastikan baris ini ada agar frontend bisa mengambil data plotting per SO
router.get("/schedule/:demand_id", plannedOrderController.getScheduleByDemand);

router.post("/auto-generate-so", plannedOrderController.autoGenerateSOSchedule);
router.get("/", plannedOrderController.getAllOrders);

module.exports = router;