const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");
const dynamicRoutes = require("./routes/dynamicRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
}));
app.use(express.json({ limit: "10kb" }));

// ── API routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use(dynamicRoutes);

// ── Swagger ───────────────────────────────────────────────────
try {
  const swaggerDocument = YAML.load("./docs/openapi.yaml");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn("Swagger docs skipped:", err.message);
}

// ── Frontend static ──────────────────────────────────────────
const distPath = path.join(__dirname, "frontend", "dist");

// Serve static files from the frontend/dist directory
app.use(express.static(distPath));

// SPA catch-all: serve index.html for any GET request that doesn't match a static file or API
app.get('/{*splat}', (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/api-docs")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});