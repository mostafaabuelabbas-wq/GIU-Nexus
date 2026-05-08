const jwt = require("jsonwebtoken");
const User = require("../models/User");
const blacklistedTokens = require("./tokenBlacklist");

// ─── PROTECT ─────────────────────────────────────────────────────
// Runs before any protected route
// Checks if the request has a valid JWT token
// If valid, attaches the full user object to req.user
exports.protect = async (req, res, next) => {
    try {
        // 1. Read the Authorization header
        const authHeader = req.headers.authorization;

        // 2. Check it exists and starts with "Bearer"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorised, no token"
            });
        }

        // 3. Extract the token (everything after "Bearer ")
        const token = authHeader.split(" ")[1];

        // 4. Verify the token using our secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4b. Check if this token has been blacklisted (user logged out)
        if (decoded.jti && blacklistedTokens.has(decoded.jti)) {
            return res.status(401).json({
                success: false,
                message: "Token has been invalidated, please log in again"
            });
        }

        // 5. Find the user this token belongs to
        const user = await User.findById(decoded._id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Not authorised, user no longer exists"
            });
        }

        // 6. Attach the user to the request so the next function can use it
        req.user = user;

        // 7. Move on to the actual route handler
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorised, token failed"
        });
    }
};

// ─── AUTHORIZE ───────────────────────────────────────────────────
// Always used AFTER protect
// Checks if the logged-in user has the right role
// Usage in a route file: protect, authorize("recruiter")
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not allowed to access this route`
            });
        }
        next();
    };
};