const express = require("express");
const router = express.Router();

const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const usageMiddleware = require("../middleware/usageMiddleware");
const logMiddleware = require("../middleware/logMiddleware");
const { apiLimiter } = require("../middleware/rateLimitMiddleware");

const {
  createData,
  getData,
  updateData,
  deleteData
} = require("../controllers/dynamicController");

const checkPermission = (requiredPerm) => (req, res, next) => {
    if (req.validKey && req.validKey.permissions && !req.validKey.permissions.includes(requiredPerm)) {
        return res.status(403).json({ message: `API key does not have '${requiredPerm}' permission` });
    }
    next();
};

// ITEM 7: apiLimiter as the first middleware
router.post("/api/:collection", apiLimiter, apiKeyMiddleware, checkPermission('write'), usageMiddleware, logMiddleware, createData);
router.get("/api/:collection", apiLimiter, apiKeyMiddleware, checkPermission('read'), usageMiddleware, logMiddleware, getData);
router.put("/api/:collection/:id", apiLimiter, apiKeyMiddleware, checkPermission('write'), usageMiddleware, logMiddleware, updateData);
router.delete("/api/:collection/:id", apiLimiter, apiKeyMiddleware, checkPermission('delete'), usageMiddleware, logMiddleware, deleteData);

module.exports = router;
