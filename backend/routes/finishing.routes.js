const express = require("express");
const router = express.Router();
const finishingCtrl = require("../controllers/finishing.controller");
const itemCtrl = require("../controllers/items.controller");

// 1. Route Statis (Taruh paling atas)
router.get("/", itemCtrl.getItems);
router.put("/update-schedule", finishingCtrl.updateFinishingSchedule); // PINDAH KE SINI

// 2. Master Data Finishing
router.get("/item/:itemId", finishingCtrl.getFinishingByItem);
router.post("/", finishingCtrl.createFinishing);

// 3. Route Dinamis (Yang pakai :id taruh di bawah)
router.put("/:id", finishingCtrl.updateFinishing); 
router.post("/:id/generate-finishing", finishingCtrl.generateFinishing);
router.get("/:demandId/finishing-items", finishingCtrl.getFinishingItems);
router.delete("/:id", finishingCtrl.deleteFinishing);

module.exports = router;