const express = require("express");
const router = express.Router();
const controller = require("../controllers/formDemand.controller");
const finishingCtrl = require("../controllers/finishing.controller");

router.get("/:id/finishing-items", finishingCtrl.getFinishingItems);
router.post("/:id/generate-finishing", finishingCtrl.generateFinishing);

router.get("/", controller.getAllDemands);
router.get("/from-so/:id", controller.getDemandFromSalesOrder);
router.get("/sales-orders/:id", controller.getDemandFromSalesOrder);
router.get("/:id/items", controller.getDemandItems); // letakkan di bawah semua route khusus

router.post("/", controller.saveDemand);
router.post("/mrp/run", controller.runMRP);
router.post("/export-excel", controller.exportToExcel);

// file router
router.put("/:id/update-finishing", controller.updateFinishing); // <-- TAMBAHKAN INI
router.put("/:id", controller.updateDemand);
router.put("/:id", controller.updateDemand); // ✅ FIXED
router.post("/:id/generate-finishing", controller.generateFinishing);
router.post("/:id/generate-assembly", controller.generateAssembly);

router.delete("/:id", controller.deleteDemand);

module.exports = router;