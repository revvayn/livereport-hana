const express = require("express");
const router = express.Router();
const salesOrderItemController = require("../controllers/salesOrderItems.controller");

// Perhatikan nama fungsinya, harus sama dengan yang ada di controller
router.get("/master-items", salesOrderItemController.getMasterItemsWithRatio); 
router.get("/:id/items", salesOrderItemController.getItemsBySalesOrder);
router.post("/", salesOrderItemController.createItem);
router.put("/:id", salesOrderItemController.updateItem);
router.delete("/:id", salesOrderItemController.deleteItem);

module.exports = router;