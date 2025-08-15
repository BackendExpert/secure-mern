// middlewares/checkPermission.js
const Role = require("../models/Role");
const jwt = require('jsonwebtoken')

const checkPermission = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            // const userRole = req.user.role; 
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const roleDoc = await Role.findOne({ name: decoded.role });
            if (!roleDoc) return res.status(403).json({ message: "Role not found" });

            const userPermissions = roleDoc.permissions || [];

            const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));

            if (!hasPermission) {
                return res.status(403).json({ message: "Access denied: insufficient permissions" });
            }

            next();
        } catch (err) {
            res.status(500).json({ message: "Permission check failed", error: err.message });
        }
    };
};

module.exports = checkPermission;
