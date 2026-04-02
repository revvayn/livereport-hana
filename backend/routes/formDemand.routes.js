const express = require("express");
const router = express.Router();
const db = require("../db");
const controller = require("../controllers/formDemand.controller");
const finishingCtrl = require("../controllers/finishing.controller");


router.get("/sales-orders", async (req, res) => {
    try {
        const query = `
          SELECT 
        so.id, 
        so.so_number, 
        c.customer_name -- Mengambil nama dari tabel customers
      FROM sales_orders so
      JOIN customers c ON so.customer_id = c.id -- Join ke tabel customers
      LEFT JOIN demands d ON so.so_number = d.so_number
      WHERE d.so_number IS NULL
        `;
        const result = await db.query(query);
        res.json(result.rows);
      } catch (err) {
        console.error("Error detail:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

router.get("/:id/finishing-items", finishingCtrl.getFinishingItems);
router.post("/:id/generate-finishing", finishingCtrl.generateFinishing);

router.get("/", controller.getAllDemands);
router.get("/from-so/:id", controller.getDemandFromSalesOrder);
router.get("/sales-orders/:id", controller.getDemandFromSalesOrder);
router.get("/:id/items", controller.getDemandItems); // letakkan di bawah semua route khusus

router.post("/", controller.saveDemand);
router.post("/mrp/run", controller.runMRP);
router.post("/export-excel", controller.exportToExcel);

// file router
router.put("/:id/update-finishing", controller.updateFinishing); // <-- TAMBAHKAN INI
router.put("/:id", controller.updateDemand);
router.put("/:id", controller.updateDemand); // ✅ FIXED
router.post("/:id/generate-finishing", controller.generateFinishing);
router.post("/:id/generate-assembly", controller.generateAssembly);

router.delete("/:id", controller.deleteDemand);


module.exports = router;