const express = require("express");
const router = express.Router();
const finishingCtrl = require("../controllers/finishing.controller");

// 1. Route Statis & Global
router.get("/", finishingCtrl.getAllFinishing); // Ambil semua data
router.post("/", finishingCtrl.createFinishing);
router.put("/update-schedule", finishingCtrl.updateFinishingSchedule);

// 2. Route Spesifik (Dinamis)
router.put("/:id", finishingCtrl.updateFinishing); 
router.delete("/:id", finishingCtrl.deleteFinishing);
router.post("/:id/generate-finishing", finishingCtrl.generateFinishing);
router.get("/:demandId/finishing-items", finishingCtrl.getFinishingItems);

module.exports = router;