const jwt = require("jsonwebtoken");

const authMiddleware = async(req, res, next) => {
    try {
        const token = req.header("Authorization");

        if(!token){
            return res.status(401).json({
                message: "No Authentication Token Found!"
            });
        }

        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        // ITEM 2: req.user.id is already a string here
        req.user = decoded;
        next();

    } catch (error) {
        console.error("[authMiddleware]", error.message);
        res.status(401).json({
            message: "Invalid Token!"
        });
    }
}

module.exports = authMiddleware;