const express = require("express");
const router = express.Router();

const { firebaseLogin, generateApiKey, updateUser, deleteAccount, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter, loginLimiter, dashboardLimiter } = require("../middleware/rateLimitMiddleware");

// ITEM 7: Apply rate limits securely
router.post("/firebase", loginLimiter, firebaseLogin);
router.post("/generate-api-key", authMiddleware, authLimiter, generateApiKey);
router.get("/profile", authMiddleware, dashboardLimiter, getProfile);
router.put("/profile", authMiddleware, dashboardLimiter, updateUser);
router.delete("/account", authMiddleware, authLimiter, deleteAccount);

module.exports = router;