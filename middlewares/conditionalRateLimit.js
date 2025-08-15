const rateLimit = require("express-rate-limit");
const User = require("../models/User"); // adjust path if needed
const Role = require("../models/Role");
const jwt = require("jsonwebtoken");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
});

async function conditionalRateLimit(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) return limiter(req, res, next); // apply limiter if no token

        const token = authHeader.split(" ")[1];
        if (!token) return limiter(req, res, next);

        // Verify token (example using JWT)
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate("role");

        if (!user) return limiter(req, res, next);

        // If admin, skip rate limit
        if (user.role && user.role.name === "admin") {
            return next();
        }

        // Otherwise apply rate limiter
        return limiter(req, res, next);
    } catch (err) {
        console.error("Rate limit check failed:", err);
        return limiter(req, res, next); // fallback to limiter
    }
}

module.exports = conditionalRateLimit;
