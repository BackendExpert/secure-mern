const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
    const { fullName, username, email, password, role } = req.body;
    try {
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) return res.status(400).json({ message: "User exists" });

        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, username, email, password: hash, role });
        await newUser.save();

        res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error creating user" });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).populate("role");
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id, user.role.name);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: "Login failed" });
    }
};
