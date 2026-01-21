const express = require("express");
const router = express.Router();
const controller = require("../controllers/rejectRateFI.controller");

router.get("/grading-fi", controller.getRejectRateFI);

module.exports = router;
