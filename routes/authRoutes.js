const express = require("express");
const router = express.Router();

const { signup, generateApiKey } = require("../controllers/authController");
const { login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/generate-api-key", authMiddleware, generateApiKey);

module.exports = router;