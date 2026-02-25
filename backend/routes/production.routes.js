const express = require("express");
const router = express.Router();
const prodCtrl = require("../controllers/production.controller");

router.get("/:itemId/schedule", prodCtrl.getProductionSchedule);
router.patch("/:itemId/schedule", prodCtrl.updateProductionSchedule);

module.exports = router;