const express = require("express");
const router = express.Router();
const controller = require("../controllers/salesOrders.controller");

// --- GRUP SALES ORDER (HEADER) ---
router.get("/", controller.getSalesOrders);
router.get("/master-items", controller.getMasterItemsWithRatio); // Pindahkan ke atas agar tidak dianggap sebagai :id
router.get("/:id", controller.getSalesOrderById);
router.post("/", controller.createSalesOrder);
router.put("/:id", controller.updateSalesOrder);
router.delete("/:id", controller.deleteSalesOrder);

// --- GRUP ITEMS (DETAIL) ---
// Gunakan prefix yang jelas agar tidak bentrok
router.get("/detail/:id/items", controller.getItemsBySalesOrder);
router.post("/detail/item", controller.createItem);
router.put("/detail/item/:id", controller.updateItem);
router.delete("/detail/item/:id", controller.deleteItem);

module.exports = router;