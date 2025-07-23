const User = require("../models/User");
const Role = require("../models/Role");

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id).populate("role");
            if (!user || !user.role) return res.status(403).json({ message: "Access denied" });

            const hasPermission = user.role.permissions.includes(requiredPermission);
            if (!hasPermission) return res.status(403).json({ message: "Permission denied" });

            next();
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    };
};

module.exports = checkPermission;
