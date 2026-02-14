const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const usageMiddleware = require("../middleware/usageMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");
const {
  createData,
  getData,
  updateData,
  deleteData
} = require("../controllers/dynamicController");

router.post("/api/:collection", apiKeyMiddleware, usageMiddleware, createData);
router.get("/api/:collection", apiKeyMiddleware, usageMiddleware, getData);
router.put("/api/:collection/:id", apiKeyMiddleware, usageMiddleware, updateData);
router.delete("/api/:collection/:id", apiKeyMiddleware, usageMiddleware, deleteData);

module.exports = router;
