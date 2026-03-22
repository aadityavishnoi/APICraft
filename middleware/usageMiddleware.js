const User = require("../models/User");

const usageMiddleware = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;

        // CAT2-C: Atomic increment prevents race conditions on concurrent requests
        const result = await User.findOneAndUpdate(
            { _id: userId, $expr: { $lt: ["$usageCount", "$usageLimit"] } },
            { $inc: { usageCount: 1 } },
            { new: true }
        );

        if (!result) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: "User Not Found!"
                });
            }
            return res.status(429).json({
                message: "API Limit Exceeded!"
            });
        }

        next();
    } catch (error) {
        console.error("[usageMiddleware]", error.message);
        res.status(500).json({
            message: "Usage Tracking Failed!"
        });
    }
};

module.exports = usageMiddleware;