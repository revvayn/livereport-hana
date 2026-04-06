const express = require("express");
const router = express.Router();
const multer = require("multer"); // 1. PASTIKAN SUDAH DI-REQUIRE
const upload = multer({ storage: multer.memoryStorage() });
const finishingCtrl = require("../controllers/finishing.controller");

router.post("/import-excel", upload.single("file"), finishingCtrl.importExcel);

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