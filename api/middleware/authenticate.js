const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { email: decoded.email };
        next();
    } catch (error) {
        res.status(498).json({ message: "Invalid token." });      
    }
}

module.exports = authenticate;