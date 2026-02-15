const User = require("../models/User");

const apiKeyMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers["x-api-key"];

        if(!apiKey) {
            return res.status(404).json({
                message: "API Key Is Missing!"
            });
        }

        const user = await User.find();
        let validUser = null;

        for(const user of users) {
            if(match){
                validUser = user;
                break;
            }
        }

        if(!validUser){
            return res.status(403).json({
                message: "Invalid API Key"
            });
        }

        req.user = validUser;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "API Key Authentication Error!"
        });
    }
};
module.exports = apiKeyMiddleware;