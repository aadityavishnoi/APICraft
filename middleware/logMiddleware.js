const ApiLog = require("../models/ApiLog");

const logMiddleware = async (req, res, next) => {
  res.on("finish", async () => {
    try {
      await ApiLog.create({
        userId: (req.user._id || req.user.id).toString(),
        collectionName: req.params.collection,
        method: req.method,
        status: res.statusCode
      });
    } catch (error) {
      console.error("[logMiddleware]", error.message);
    }
  });

  next();
};

module.exports = logMiddleware;
