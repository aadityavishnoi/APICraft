const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { dashboardLimiter } = require("../middleware/rateLimitMiddleware");

const { createCollection, getCollection, deleteCollection, updateCollection, getApiLogs, getLogStats, generateDocs } = require("../controllers/apiController");
const validateCollection = require("../middleware/validationMiddleware");

// ITEM 7: dashboardLimiter after authMiddleware
router.post("/create-collection", authMiddleware, dashboardLimiter, validateCollection, createCollection);
router.get("/collections", authMiddleware, dashboardLimiter, getCollection);
router.delete("/collections/:name", authMiddleware, dashboardLimiter, deleteCollection);
router.put("/collections/:name", authMiddleware, dashboardLimiter, updateCollection);

router.get("/api-logs", authMiddleware, dashboardLimiter, getApiLogs);
router.get("/logs/stats", authMiddleware, dashboardLimiter, getLogStats);
router.get("/api-docs", authMiddleware, dashboardLimiter, generateDocs);

const { getKeys, createKey, deleteKey, updateKey, rotateKey } = require("../controllers/keyController");

router.get("/keys", authMiddleware, dashboardLimiter, getKeys);
router.post("/keys", authMiddleware, dashboardLimiter, createKey);
router.delete("/keys/:id", authMiddleware, dashboardLimiter, deleteKey);
router.put("/keys/:id", authMiddleware, dashboardLimiter, updateKey);
router.post("/keys/:id/rotate", authMiddleware, dashboardLimiter, rotateKey);

module.exports = router;