const express = require("express");
const router = express.Router();
const db = require("../db"); // Sesuaikan path db
const controller = require("../controllers/formDemand.controller");
const finishingCtrl = require("../controllers/finishing.controller");

/* ============================================================
   1. STATIC ROUTES (HARUS DI ATAS)
   ============================================================ */

// Mendapatkan SO yang belum ditarik ke Demand
router.get("/sales-orders", async (req, res) => {
    try {
        const query = `
            SELECT so.id, so.so_number, c.customer_name 
            FROM sales_orders so
            JOIN customers c ON so.customer_id = c.id 
            LEFT JOIN demands d ON so.so_number = d.so_number
            WHERE d.so_number IS NULL
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Mendapatkan daftar hari libur
router.get("/holidays", controller.getHolidays);

// Export Excel
router.post("/export-excel", controller.exportToExcel);

// Run MRP
router.post("/mrp/run", controller.runMRP);

/* ============================================================
   2. COLLECTION ROUTES (LIST & SAVE)
   ============================================================ */

router.get("/", controller.getAllDemands);
router.post("/", controller.saveDemand);

/* ============================================================
   3. DYNAMIC ROUTES (DENGAN ID)
   ============================================================ */

// Route From Sales Order (Satu SO detail)
router.get("/sales-orders/:id", controller.getDemandFromSalesOrder);

// Detail Items per Demand
router.get("/:id/items", controller.getDemandItems);

// Finishing & Assembly Routes
router.get("/:id/finishing-items", finishingCtrl.getFinishingItems);
router.post("/:id/generate-finishing", finishingCtrl.generateFinishing);
router.post("/:id/generate-assembly", controller.generateAssembly); // Pastikan ada di controller

// Update & Delete
router.put("/:id/update-finishing", controller.updateFinishing);
router.put("/:id", controller.updateDemand); // Cukup satu kali saja
router.delete("/:id", controller.deleteDemand);

module.exports = router;