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

router.post("/api/:collection", apiKeyMiddleware, usageMiddleware, logMiddleware, createData);
router.get("/api/:collection", apiKeyMiddleware, usageMiddleware, logMiddleware, getData);
router.put("/api/:collection/:id", apiKeyMiddleware, usageMiddleware, logMiddleware, updateData);
router.delete("/api/:collection/:id", apiKeyMiddleware, usageMiddleware, logMiddleware, deleteData);

module.exports = router;
