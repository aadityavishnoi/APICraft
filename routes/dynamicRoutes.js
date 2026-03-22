const express = require("express");
const router = express.Router();

const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const usageMiddleware = require("../middleware/usageMiddleware");
const logMiddleware = require("../middleware/logMiddleware");
const { apiLimiter } = require("../middleware/rateLimitMiddleware");

const {
  createData,
  getData,
  getSingleData,
  updateData,
  deleteData
} = require("../controllers/dynamicController");

const checkPermission = (requiredPerm) => (req, res, next) => {
    const permissions = req.validKey && req.validKey.permissions;
    const hasValidPermissions = Array.isArray(permissions);

    if (!hasValidPermissions || !permissions.includes(requiredPerm)) {
        return res.status(403).json({ message: `API key does not have '${requiredPerm}' permission` });
    }
    next();
};

// ITEM 7: apiLimiter as the first middleware
router.post("/api/:collection", apiLimiter, apiKeyMiddleware, checkPermission('write'), usageMiddleware, logMiddleware, createData);
router.get("/api/:collection", apiLimiter, apiKeyMiddleware, checkPermission('read'), usageMiddleware, logMiddleware, getData);
router.get("/api/:collection/:id", apiLimiter, apiKeyMiddleware, checkPermission('read'), usageMiddleware, logMiddleware, getSingleData);
router.put("/api/:collection/:id", apiLimiter, apiKeyMiddleware, checkPermission('write'), usageMiddleware, logMiddleware, updateData);
router.delete("/api/:collection/:id", apiLimiter, apiKeyMiddleware, checkPermission('delete'), usageMiddleware, logMiddleware, deleteData);

module.exports = router;
