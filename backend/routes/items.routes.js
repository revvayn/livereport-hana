const express = require("express");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const controller = require("../controllers/items.controller");

router.post("/import-excel", upload.single("file"), controller.importExcel);

router.get("/", controller.getItems);
router.get("/:id", controller.getItemById);
router.post("/", controller.createItem);
router.put("/:id", controller.updateItem);
router.delete("/:id", controller.deleteItem);

module.exports = router;
