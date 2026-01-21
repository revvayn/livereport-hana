const express = require("express");
const router = express.Router();
const controller = require("../controllers/rejectRateFG.controller");

router.get("/grading-fg", controller.getRejectRateFG);

module.exports = router;
