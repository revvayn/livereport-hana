const express = require("express");
const router = express.Router();
const controller = require("../controllers/packing.controller");

router.get("/", controller.getAllDemands);
router.get("/from-so/:id", controller.getDemandFromSalesOrder);
router.get("/sales-orders/:id", controller.getDemandFromSalesOrder);
router.get("/:id/items", controller.getDemandItems); // letakkan di bawah semua route khusus

router.post("/", controller.saveDemand);
router.post("/mrp/run", controller.runMRP);
router.post("/export-excel", controller.exportToExcel);

// file router
router.put("/:id", controller.updateDemand);

router.delete("/:id", controller.deleteDemand);

module.exports = router;