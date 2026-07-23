require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const logRoutes = require("./routes/logs");

const app = express();

// 10,000 log records as JSON can be a few MB, so raise the body size limit.
app.use(express.json({ limit: "25mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/logs", logRoutes);

// Basic error handler (e.g. malformed JSON body)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body." });
  }
  console.error(err);
  res.status(500).json({ message: "Unexpected server error." });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
