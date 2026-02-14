const User = require("../models/User");

const apiKeyMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers["x-api-key"];

        if(!apiKey) {
            return res.status(404).json({
                message: "API Key Is Missing!"
            });
        }

        const user = await User.findOne({ apiKey });

        if(!user){
            return res.status(403).json({
                message: "Invalid API Key"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "API Key Authentication Error!"
        });
    }
};
module.exports = apiKeyMiddleware;