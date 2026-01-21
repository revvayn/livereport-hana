const express = require("express");
const router = express.Router();
const {
  getRejectRateSanding,
} = require("../controllers/rejectRateSanding.controller");

router.get("/sanding", getRejectRateSanding);

module.exports = router;
