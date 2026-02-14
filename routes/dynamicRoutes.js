const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const usageMiddleware = require("../middleware/usageMiddleware");
const {
  createData,
  getData,
  updateData,
  deleteData
} = require("../controllers/dynamicController");

router.post("/api/:collection", authMiddleware, usageMiddleware, createData);
router.get("/api/:collection", authMiddleware, usageMiddleware, getData);
router.put("/api/:collection/:id", authMiddleware, usageMiddleware, updateData);
router.delete("/api/:collection/:id", authMiddleware, usageMiddleware, deleteData);

module.exports = router;
