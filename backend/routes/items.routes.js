const express = require("express");
const router = express.Router();
const controller = require("../controllers/items.controller");

router.get("/", controller.getItems);
router.get("/:id", controller.getItemById);
router.post("/", controller.createItem);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;
