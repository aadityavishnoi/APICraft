const User = require("../models/User");
const bcrypt = require("bcrypt");

const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        message: "API key missing"
      });
    }

    if (!apiKey.includes('.')) {
        return res.status(401).json({
          message: "Invalid API key format"
        });
    }

    const [userId, secretPart] = apiKey.split('.');

    const user = await User.findById(userId);

    if (!user || !user.apiKey) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    const match = await bcrypt.compare(secretPart, user.apiKey);

    if (!match) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "API key authentication error"
    });
  }
};

module.exports = apiKeyMiddleware;
