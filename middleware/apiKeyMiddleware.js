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

    // All users with API key
    const users = await User.find({ apiKey: { $exists: true } });

    let validUser = null;

    for (const user of users) {
      const match = await bcrypt.compare(apiKey, user.apiKey);

      if (match) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      return res.status(403).json({
        message: "Invalid API key"
      });
    }

    req.user = validUser;
    next();

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "API key authentication error"
    });
  }
};

module.exports = apiKeyMiddleware;
