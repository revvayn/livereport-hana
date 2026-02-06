const express = require("express");
const router = express.Router();
const controller = require("../controllers/itemRoutings.controller");

router.get("/", controller.getItemRoutings);
router.get("/:id", controller.getItemRoutingById);
router.post("/", controller.createItemRouting);
router.put("/:id", controller.updateItemRouting);
router.delete("/:id", controller.deleteItemRouting);

module.exports = router;
