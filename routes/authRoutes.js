const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { signup, generateApiKey } = require("../controllers/authController");
const { login, updateUser, deleteAccount, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateSignup, validateLogin } = require("../middleware/authValidation");

// CAT6-A: Rate limiting on auth endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // 10 attempts per window per IP
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,                    // 5 signups per hour per IP
    message: { message: "Too many accounts created, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
});

router.post("/signup", signupLimiter, validateSignup, signup);
router.post("/login", loginLimiter, validateLogin, login);
router.post("/generate-api-key", authMiddleware, generateApiKey);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateUser);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;