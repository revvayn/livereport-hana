const express = require("express");
const router = express.Router();
const controller = require("../controllers/rejectRateMechine.controller");

router.get("/reject-by-machine", controller.getRejectByMachine);

module.exports = router;
