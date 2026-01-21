require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("./config/session");

const authRoutes = require("./routes/auth.routes");
const dataRoutes = require("./routes/data.routes");
const rejectRateRoutes = require("./routes/rejectRateMechine.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session);

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/reject-rate", rejectRateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
