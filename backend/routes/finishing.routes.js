const express = require("express");
const router = express.Router();
const finishingCtrl = require("../controllers/finishing.controller");
const itemCtrl = require("../controllers/items.controller");

router.get("/", itemCtrl.getItems);
router.get("/item/:itemId", finishingCtrl.getFinishingByItem);
// routes/finishing.js (atau demand.js tergantung struktur Anda)
router.post("/:id/generate-finishing", finishingCtrl.generateFinishing);
router.get("/:id/finishing-items", finishingCtrl.getFinishingItems);
router.put("/:id/update-finishing", finishingCtrl.updateFinishingSchedule); // Buat fungsi update di controller

router.post("/", finishingCtrl.createFinishing);
router.put("/:id", finishingCtrl.updateFinishing);
router.delete("/:id", finishingCtrl.deleteFinishing);

module.exports = router;