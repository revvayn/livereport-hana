const express = require("express");
const router = express.Router();
const multer = require("multer"); // 1. PASTIKAN SUDAH DI-REQUIRE
const upload = multer({ storage: multer.memoryStorage() });
const controller = require("../controllers/customers.controller");

// --- ROUTE STATIS (Taruh di Atas) ---

router.get("/", controller.getCustomers);
router.post("/", controller.createCustomer);

// 2. PINDAHKAN IMPORT KE SINI (Sebelum route /:id)
router.post("/import-excel", upload.single("file"), controller.importExcelCustomers);


// --- ROUTE DINAMIS (Taruh di Bawah) ---

router.get("/:id", controller.getCustomerById);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);

module.exports = router;