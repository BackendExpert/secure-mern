const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");

function secureMern(app, options = {}) {
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan("dev"));

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });

    app.use(limiter);
    app.use(csrf({ cookie: true }));

    app.use("/auth", authRoutes);
}

module.exports = secureMern;