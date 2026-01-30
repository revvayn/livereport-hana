const express = require("express");
const multer = require("multer");
const router = express.Router();
const bomController = require("../controllers/bom.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), bomController.uploadBOM);
router.get("/", bomController.getBOM);


module.exports = router;
