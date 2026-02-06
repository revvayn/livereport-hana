const express = require("express");
const router = express.Router();
const controller = require("../controllers/salesOrders.controller");

router.get("/", controller.getSalesOrders);
router.get("/:id", controller.getSalesOrderById);
router.post("/", controller.createSalesOrder);
router.put("/:id", controller.updateSalesOrder);
router.delete("/:id", controller.deleteSalesOrder);

module.exports = router;
