const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createCollection, getCollection, deleteCollection, updateCollection, getApiLogs, getLogStats, generateDocs } = require("../controllers/apiController");
const validationCollection = require("../middleware/validationMiddleware");
router.get("/api-logs", authMiddleware, getApiLogs);
router.get("/logs/stats", authMiddleware, getLogStats);
router.post("/create-collection", authMiddleware, validationCollection, createCollection);
router.get("/collections", authMiddleware, getCollection);
router.delete("/collections/:name", authMiddleware, deleteCollection);
router.put("/collections/:name", authMiddleware, updateCollection);
router.get("/api-docs", authMiddleware, generateDocs);

const { getKeys, createKey, deleteKey, updateKey, rotateKey } = require("../controllers/keyController");
router.get("/keys", authMiddleware, getKeys);
router.post("/keys", authMiddleware, createKey);
router.delete("/keys/:id", authMiddleware, deleteKey);
router.put("/keys/:id", authMiddleware, updateKey);
router.post("/keys/:id/rotate", authMiddleware, rotateKey);

module.exports = router;