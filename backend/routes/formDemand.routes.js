const express = require("express");
const router = express.Router();
const demandController = require("../controllers/formDemand.controller");

router.post("/", demandController.createDemand);
router.get("/", demandController.getDemand);

module.exports = router;
