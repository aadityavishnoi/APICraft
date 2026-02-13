const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({
            message: "Token Missing!"
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next()
    } catch (error) {
        console.log(error);
        res.status(401).json({
            message: "Invalid Token!"
        });
    }
}

module.exports = authMiddleware;