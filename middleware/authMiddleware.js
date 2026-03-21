const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Token Missing!" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token Expired!" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid Token!" });
        }
        return res.status(500).json({ message: "Authentication Error!" });
    }
};

module.exports = authMiddleware;