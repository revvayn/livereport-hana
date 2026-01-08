require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("./config/session");
const authRoutes = require("./routes/auth.routes");
const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session);

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
// ======================
// SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
