const express = require("express");
const {
  getKedatanganGrader,
} = require("../controllers/BBPerforma.controller");

const router = express.Router();

router.get("/kedatangan-grader", getKedatanganGrader);

module.exports = router;
