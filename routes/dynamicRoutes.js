const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createData,
  getData,
  updateData,
  deleteData
} = require("../controllers/dynamicController");

router.post("/api/:collection", authMiddleware, createData);
router.get("/api/:collection", authMiddleware, getData);
router.put("/api/:collection/:id", authMiddleware, updateData);
router.delete("/api/:collection/:id", authMiddleware, deleteData);

module.exports = router;
