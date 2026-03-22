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
const distPath = path.join(__dirname, "public");

// Serve static files from the public directory
app.use(express.static(distPath));

// serve index.html for root path only
app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Catch-all: Anything not matched by standard routes or static files returns 404
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
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