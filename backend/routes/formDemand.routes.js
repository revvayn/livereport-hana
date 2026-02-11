const express = require("express");
const router = express.Router();
const controller = require("../controllers/formDemand.controller");

// Pastikan semua menggunakan prefix 'controller.'
router.get("/", controller.getAllDemands);
router.get("/:id/items", controller.getDemandItems); 
router.delete("/:id", controller.deleteDemand); // SEBELUMNYA ERROR DI SINI
router.post("/mrp/run", controller.runMRP);
router.post("/", controller.saveDemand);
router.post("/export-excel", controller.exportToExcel);
router.get("/from-so/:id", controller.getDemandFromSalesOrder);
// Di file routes Anda
router.get("/sales-orders/:id", controller.getDemandFromSalesOrder);

module.exports = router;