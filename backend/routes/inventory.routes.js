const express = require("express");
const multer = require("multer");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), inventoryController.uploadInventory);
router.get("/", inventoryController.getInventory);
router.delete("/clear", inventoryController.clearInventory);


module.exports = router;
