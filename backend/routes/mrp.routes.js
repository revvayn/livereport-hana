const express = require("express");
const router = express.Router();
const mrpController = require("../controllers/mrp.controller");

router.post("/run", mrpController.runMRP);

module.exports = router;
