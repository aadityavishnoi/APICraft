const ApiLog = require("../models/ApiLog");
const mongoose = require('mongoose');

const logMiddleware = async (req, res, next) => {
  res.on("finish", async () => {
    try {
      // ITEM 16: Log with consistent ObjectIDs
      if (!req.user?.id) return; // skip if unauthenticated

      await ApiLog.create({
        userId: new mongoose.Types.ObjectId(req.user.id),
        collectionName: req.params.collection,
        method: req.method,
        status: res.statusCode
      });
    } catch (error) {
      console.log('Logging error:', error.message);
    }
  });

  next();
};

module.exports = logMiddleware;
