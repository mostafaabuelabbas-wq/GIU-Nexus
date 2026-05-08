const rateLimit = require("express-rate-limit");

// 10 requests per 15-minute window, per IP address
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,                   // limit each IP to 10 requests per window
    standardHeaders: true,     // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,      // Disable `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes"
    }
});

// Stricter limiter for OTP verification — 5 attempts per 10 minutes
// Prevents brute-forcing 6-digit OTPs while allowing a few typo retries
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes (matches OTP expiry)
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP attempts, please request a new OTP"
    }
});

module.exports = { authLimiter, otpLimiter };
