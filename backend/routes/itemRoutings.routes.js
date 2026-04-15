const express = require("express");
const router = express.Router();
const multer = require("multer"); // 1. PASTIKAN SUDAH DI-REQUIRE
const upload = multer({ storage: multer.memoryStorage() });
const controller = require("../controllers/itemRoutings.controller");

router.get("/", controller.getItemRoutings); // Baris ini biasanya penyebabnya jika getItemRoutings undefined
router.post("/", controller.createItemRouting);
router.put("/:id", controller.updateItemRouting);
router.delete("/:id", controller.deleteItemRouting);

router.post("/upload", upload.single("file"), controller.uploadExcel);

module.exports = router;