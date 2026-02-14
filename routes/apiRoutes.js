const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createCollection } = require("../controllers/apiController");

router.post("/create-collection", authMiddleware, createCollection);

module.exports = router;