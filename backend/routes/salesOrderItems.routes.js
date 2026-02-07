const express = require("express");
const router = express.Router();
const controller = require("../controllers/salesOrderItems.controller");

// Route untuk mengambil items berdasarkan ID Sales Order (PENTING!)
// Ini yang dipanggil oleh Frontend: api.get(`/sales-orders/${soId}/items`)
router.get("/:id/items", controller.getItemsBySalesOrder);

 

// Route lainnya
router.get("/", controller.getAllSalesOrderItems);
router.post("/", controller.createItem);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;