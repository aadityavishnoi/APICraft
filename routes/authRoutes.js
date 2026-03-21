const express = require("express");
const router = express.Router();

const { signup, generateApiKey } = require("../controllers/authController");
const { login, updateUser, deleteAccount } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/generate-api-key", authMiddleware, generateApiKey);
router.put("/profile", authMiddleware, updateUser);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;