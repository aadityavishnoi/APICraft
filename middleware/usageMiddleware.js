const User = require("../models/User");

const usageMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                message: "User Not Found!"
            });
        }

        if(user.usageCount >= user.usageLimit) {
            res.json({
                message: "API Limit Exceeded!"
            });
        }

        user.usageCount += 1;
        await user.save();
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Usage Tracking Failed!"
        });
    }
};

module.exports = usageMiddleware;