const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createCollection, getCollection, deleteCollection, updateCollection } = require("../controllers/apiController");

router.post("/create-collection", authMiddleware, createCollection);
router.get("/collections", authMiddleware, getCollection);
router.delete("/collections/:name", authMiddleware, deleteCollection);
router.put("/collections/:name", authMiddleware, updateCollection);
module.exports = router;