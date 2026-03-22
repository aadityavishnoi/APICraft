require('dotenv').config();

// ITEM 5: Ensure strict failure on missing vital configs before spinning anything up
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const dynamicRoutes = require('./routes/dynamicRoutes');

const app = express();

// ── Middleware Pipeline ──────────────────────────────────────

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
try {
    const swaggerDocument = YAML.load('./docs/openapi.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.error("Swagger YAML not found", e.message);
}

// Provide trust proxy for correct IP limits in reverse-proxy situations
if (process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// ── Root SPA Fallback (Moved to end in production, but defined early here for dev) ──
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// ITEM 15: Explicitly hardened Helmet policy
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: false, // Disabled — frontend is on a separate Vercel domain
  crossOriginEmbedderPolicy: false
}));

// Provide generous but finite body limits to prevent JSON DoS
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// ITEM 14: Read allowed CORS explicitly from an env array
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'https://api-craft-neon.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));


// ── Backend Routes ──────────────────────────────────────────
// Static / Dashboard Routes:
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Dynamic User Routes:
app.use('/', dynamicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    // Only pass CORS explicit errors cleanly; hide rest
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: err.message });
    }
    console.error("[GlobalError]", err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? "Internal server error" : (err.message || "Internal server error")
    });
});

// ── Database Connection ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));

// ── Serving SPA ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    // Single page Application Fallback
    app.get('*', (req, res) => {
        // Prevent API requests from resolving to index.html on missing endpoints
        if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
            return res.status(404).json({ error: "API Route Not Found" })
        }
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}
