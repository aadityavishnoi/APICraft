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

    if (!user) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    let match = false;
    let validKeyObj = null;

    if (user.apiKey) {
      match = await bcrypt.compare(secretPart, user.apiKey);
    }

    if (!match && user.apiKeys && user.apiKeys.length > 0) {
      for (let k of user.apiKeys) {
        if (!k.revoked) {
          const isMatch = await bcrypt.compare(secretPart, k.keyHash);
          if (isMatch) {
            match = true;
            validKeyObj = k;
            break;
          }
        }
      }
    }

    if (!match) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    if (validKeyObj) {
      validKeyObj.lastUsed = new Date();
      validKeyObj.requestCount += 1;
      await user.save();
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
