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
app.use("/api/planning", require("./routes/formPlanning.routes"));
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
