require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("./config/session");

const authRoutes = require("./routes/auth.routes");
const dataRoutes = require("./routes/data.routes");
const dataBahanRoutes = require("./routes/dataBahan.routes");
const app = express();

/* ======================
   CORS
====================== */
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

/* ======================
   BODY PARSER
====================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================
   SESSION
====================== */
app.use(session);

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/bahanbaku", dataBahanRoutes);

// reject rate (SENDIRI-SENDIRI)
app.use("/api/customers", require("./routes/customers.routes"));
app.use("/api/items", require("./routes/items.routes"));
app.use("/api/machines", require("./routes/machines.routes"));
app.use("/api/operations", require("./routes/operations.routes"));
app.use("/api/item-routings", require("./routes/itemRoutings.routes"));
app.use("/api/sales-orders", require("./routes/salesOrders.routes"));
app.use("/api/sales-order-items", require("./routes/salesOrderItems.routes"));
app.use("/api/demand", require("./routes/formDemand.routes"));
app.use("/api/bom-calculation", require("./routes/bomCalculation.routes"));


app.use("/api/mrp", require("./routes/mrp.routes"));
app.use("/api/planned-order", require("./routes/plannedOrder.routes"));
app.use("/api/bom-calculation", require("./routes/bomCalculation.routes"));
app.use("/api/bom", require("./routes/bom.routes"));
app.use("/api/reject-rate", require("./routes/rejectRateMechine.routes"));
app.use("/api/reject-rate", require("./routes/rejectRateFG.routes"));
app.use("/api/reject-rate", require("./routes/rejectRateFI.routes"));
app.use("/api/reject-rate", require("./routes/rejectRateHotpress.routes"));
app.use("/api/reject-rate", require("./routes/rejectRateBD.routes"));
app.use("/api/reject-rate", require("./routes/rejectRateSanding.routes"));
app.use("/api/bahan-baku", require("./routes/BBPerforma.routes"));
app.use("/api/bahan-baku", require("./routes/BBAsalLog.routes"));

/* ======================
   SERVER
====================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
