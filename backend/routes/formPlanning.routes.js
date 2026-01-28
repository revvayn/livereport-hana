const express = require("express");
const router = express.Router();
const planningController = require("../controllers/formPlanning.controller");

router.post("/form", planningController.planningFromBom);

module.exports = router;

