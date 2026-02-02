const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const itemsController = require("../controllers/items.controller");

router.get("/", itemsController.getItems);
router.post("/upload", upload.single("file"), itemsController.uploadItems);
router.delete("/clear", itemsController.clearItems);

module.exports = router;
