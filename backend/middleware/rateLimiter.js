const rateLimit = require("express-rate-limit");

const skipInTest = () => process.env.NODE_ENV === "test";

// 10 requests per 15-minute window, per IP address
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});

// Stricter limiter for OTP verification — 5 attempts per 10 minutes
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTest,
    message: {
        success: false,
        message: "Too many OTP attempts, please request a new OTP"
    }
});

module.exports = { authLimiter, otpLimiter };
