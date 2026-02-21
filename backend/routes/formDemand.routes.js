const express = require("express");
const router = express.Router();
const controller = require("../controllers/formDemand.controller");

router.get("/", controller.getAllDemands);
router.get("/:id/items", controller.getDemandItems);
router.get("/from-so/:id", controller.getDemandFromSalesOrder);
router.get("/sales-orders/:id", controller.getDemandFromSalesOrder);

router.post("/", controller.saveDemand);
router.post("/mrp/run", controller.runMRP);
router.post("/export-excel", controller.exportToExcel);

router.put("/:id", controller.updateDemand); // ✅ FIXED
router.post("/:id/generate-finishing", controller.generateFinishing);

router.delete("/:id", controller.deleteDemand);

module.exports = router;