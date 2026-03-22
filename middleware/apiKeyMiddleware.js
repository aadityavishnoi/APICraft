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

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    let match = false;
    let validKeyObj = null;

    // ITEM 6: Iterating apiKeys array only (legacy user.apiKey bypass removed)
    if (user.apiKeys && user.apiKeys.length > 0) {
      const incomingPrefix = secretPart.substring(0, 8); 
      for (let k of user.apiKeys) {
        if (!k.revoked && (!k.keyPrefix || k.keyPrefix === incomingPrefix)) {
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

    // ITEM 2: Update lastUsed/requestCount BEFORE normalizing
    if (validKeyObj) {
      validKeyObj.lastUsed = new Date();
      validKeyObj.requestCount += 1;
      await user.save();
    }

    // ITEM 2: Set req.user to a normalized plain object matching authMiddleware
    req.user = {
      id: user._id.toString(),
      _id: user._id
    };

    req.validKey = validKeyObj;
    req.apiKeyObj = validKeyObj; // as requested

    next();

  } catch (error) {
    console.error("[apiKeyMiddleware]", error.message);
    res.status(500).json({
      message: "API key authentication error"
    });
  }
};

module.exports = apiKeyMiddleware;
