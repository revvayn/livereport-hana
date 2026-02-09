const express = require("express");
const router = express.Router();
const controller = require("../controllers/formDemand.controller");

router.get("/from-so/:id", controller.getDemandFromSalesOrder);
// Di file router Anda
router.post("/export-excel", controller.exportToExcel);

module.exports = router;
