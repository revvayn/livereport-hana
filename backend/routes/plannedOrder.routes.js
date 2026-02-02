// routes/plannedOrder.routes.js
const express = require("express");
const router = express.Router();
const { getPlannedOrders } = require("../controllers/plannedOrder.controller");

router.get("/", getPlannedOrders);

module.exports = router;
