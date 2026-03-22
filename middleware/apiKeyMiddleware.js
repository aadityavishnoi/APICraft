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

    // CAT2-A: Removed legacy user.apiKey check — it bypassed revocation
    if (user.apiKeys && user.apiKeys.length > 0) {
      const incomingPrefix = secretPart.substring(0, 8); // CAT6-C pre-filter
      for (let k of user.apiKeys) {
        // Skip revoked keys; use prefix pre-filter when available (backwards compat: match if no prefix stored)
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

    if (validKeyObj) {
      validKeyObj.lastUsed = new Date();
      validKeyObj.requestCount += 1;
      await user.save();
    }

    // CAT5-D/CAT1-B: Only expose minimal identity — not the full User doc
    req.user = { id: user._id.toString(), _id: user._id };
    // CAT3-A: Expose matched key for downstream permission checks
    req.validKey = validKeyObj;
    next();

  } catch (error) {
    console.error("[apiKeyMiddleware]", error.message);
    res.status(500).json({
      message: "API key authentication error"
    });
  }
};

module.exports = apiKeyMiddleware;
