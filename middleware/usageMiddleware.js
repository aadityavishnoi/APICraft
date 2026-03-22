const User = require("../models/User");

const usageMiddleware = async (req, res, next) => {
    try {
        // ITEM 17: req.user.id is guaranteed to be a string after Item 2
        // Mongoose findById accepts both string and ObjectId
        const userId = req.user.id;

        const result = await User.findOneAndUpdate(
            { _id: userId, $expr: { $lt: ["$usageCount", "$usageLimit"] } },
            { $inc: { usageCount: 1 } },
            { returnDocument: 'after' }
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