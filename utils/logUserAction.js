// utils/logUserAction.js
const Userlogs = require('../models/Userlogs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const logUserAction = async (req, action, description, metadata = {}, userId = null) => {
    try {
        let finalUserId = userId;

        // If no userId provided manually, try to get it from token
        if (!finalUserId) {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findOne({ email: decoded.email });
                    if (user) {
                        finalUserId = user._id;
                    } else {
                        throw new Error("User not found");
                    }
                } catch (err) {
                    console.warn("Token invalid or expired. Provide userId manually if needed.");
                }
            }
        }

        if (!finalUserId) {
            throw new Error("No userId provided and token not found or invalid");
        }

        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await Userlogs.create({
            user: finalUserId,
            action,
            description,
            ipAddress,
            userAgent,
            metadata
        });

    } catch (err) {
        console.error("Failed to log user action:", err.message);
    }
};

module.exports = logUserAction;
