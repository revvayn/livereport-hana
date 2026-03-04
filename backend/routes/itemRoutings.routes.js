const express = require("express");
const router = express.Router();
const controller = require("../controllers/itemRoutings.controller");

router.get("/", controller.getItemRoutings); // Baris ini biasanya penyebabnya jika getItemRoutings undefined
router.post("/", controller.createItemRouting);
router.put("/:id", controller.updateItemRouting);
router.delete("/:id", controller.deleteItemRouting);

module.exports = router;