const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const morgan = require("morgan");
const conditionalRateLimit = require("./middlewares/conditionalRateLimit");

const authRoutes = require("./routes/authRoutes");
const ConnectDB = require("./config/DB");

function secureMern(app, options = {}) {
    ConnectDB()

    app.use(cors({
        origin: options.origin || "http://localhost:5173",
        credentials: true
    }));


    app.use(helmet());
    app.use(express.json());
    app.use(cookieParser());
    app.use(morgan("dev"));

    // const limiter = rateLimit({
    //     windowMs: 15 * 60 * 1000,
    //     max: 1,
    // });

    app.use(conditionalRateLimit);

    // app.use(limiter);

    // CSRF middleware disabled for now
    // app.use(csrf({ cookie: true }));

    app.use("/auth", authRoutes);
}

module.exports = secureMern;
