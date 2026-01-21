const express = require("express");
const router = express.Router();
const {
  getRejectRateHotpress,
} = require("../controllers/rejectRateHotpress.controller");

router.get("/hotpress", getRejectRateHotpress);

module.exports = router;
