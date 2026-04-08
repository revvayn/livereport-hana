const express = require("express");
const router = express.Router();
const workCenterController = require("../controllers/workCenter.controller");

router.get("/", workCenterController.getWorkCenters);
router.post("/", workCenterController.createWorkCenter);
router.put("/:id", workCenterController.updateWorkCenter);
router.delete("/:id", workCenterController.deleteWorkCenter);

module.exports = router;