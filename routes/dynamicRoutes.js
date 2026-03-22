const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const usageMiddleware = require("../middleware/usageMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const logMiddleware = require("../middleware/logMiddleware");

const {
  createData,
  getData,
  updateData,
  deleteData
} = require("../controllers/dynamicController");

// CAT3-A: Permission check middleware
const checkPermission = (requiredPerm) => (req, res, next) => {
    if (req.validKey && req.validKey.permissions && !req.validKey.permissions.includes(requiredPerm)) {
        return res.status(403).json({ message: `API key does not have '${requiredPerm}' permission` });
    }
    next();
};

router.post("/api/:collection", apiKeyMiddleware, checkPermission('write'), usageMiddleware, logMiddleware, createData);
router.get("/api/:collection", apiKeyMiddleware, checkPermission('read'), usageMiddleware, logMiddleware, getData);
router.put("/api/:collection/:id", apiKeyMiddleware, checkPermission('write'), usageMiddleware, logMiddleware, updateData);
router.delete("/api/:collection/:id", apiKeyMiddleware, checkPermission('delete'), usageMiddleware, logMiddleware, deleteData);

module.exports = router;
