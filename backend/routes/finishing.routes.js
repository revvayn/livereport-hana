const express = require("express");
const router = express.Router();
const finishingCtrl = require("../controllers/finishing.controller");
const itemCtrl = require("../controllers/items.controller");

// Karena di server.js sudah pakai "/api/finishing-items", 
// maka cukup pakai "/" untuk memanggil dropdown items
router.get("/", itemCtrl.getItems); 

// Detail finishing per item
// URL: /api/finishing-items/item/:itemId
router.get("/item/:itemId", finishingCtrl.getFinishingByItem);

// CRUD
// URL: /api/finishing-items/ (POST & PUT & DELETE)
router.post("/", finishingCtrl.createFinishing);
router.put("/:id", finishingCtrl.updateFinishing);
router.delete("/:id", finishingCtrl.deleteFinishing);

module.exports = router;