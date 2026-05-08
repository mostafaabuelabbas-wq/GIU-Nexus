const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../services/emailService");
const blacklistedTokens = require("../middleware/tokenBlacklist");

const signToken = (id, role) => {
    return jwt.sign(
        { _id: id, role: role, jti: crypto.randomUUID() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// ─── REGISTER ────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Cannot register as admin"
            });
        }
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "Please provide name, email, password, and role" });
        }

        if (!["jobSeeker", "recruiter"].includes(role)) {
            return res.status(400).json({ success: false, message: "Role must be jobSeeker or recruiter" });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        let status = null;
        if (role === "recruiter") status = "pending";
        if (role === "jobSeeker") status = "approved";

        const user = await User.create({ name, email, password, role, status });
        const token = signToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        next(error);
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please provide email and password" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = signToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                profilePicture: user.profilePicture,
                skills: user.skills
            }
        });

    } catch (error) {
        next(error);
    }
};

// ─── LOGOUT ────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.jti) {
                blacklistedTokens.add(decoded.jti);
            }
        } catch (err) {
            // Token already invalid — nothing to blacklist
        }
    }
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────
// Step 1: User provides email → receives a 6-digit OTP via email
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        // Always return 200 — never reveal if email exists or not
        if (!user) {
            return res.status(200).json({ success: true, message: "If that email is registered, an OTP has been sent" });
        }

        // Generate a 6-digit OTP
        const otpRaw = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHashed = crypto.createHash("sha256").update(otpRaw).digest("hex");

        // Also prepare the reset token (will only be revealed after OTP verification)
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.otp = otpHashed;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                to: user.email,
                subject: "Your Password Reset OTP",
                text: `Your OTP for password reset is: ${otpRaw}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, ignore this email.`
            });
        } catch (emailErr) {
            console.error("OTP email failed:", emailErr.message);
        }

        return res.status(200).json({ success: true, message: "If that email is registered, an OTP has been sent" });

    } catch (error) {
        next(error);
    }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────
// Step 2: User provides email + OTP → receives the reset token
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Please provide email and OTP" });
        }

        const otpHashed = crypto.createHash("sha256").update(otp).digest("hex");

        const user = await User.findOne({
            email: email.toLowerCase(),
            otp: otpHashed,
            otpExpires: { $gt: Date.now() }
        }).select("+otp +otpExpires +passwordResetToken");

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // OTP is valid — clear it so it can't be reused
        const resetToken = user.passwordResetToken;
        user.otp = null;
        user.otpExpires = null;
        await user.save({ validateBeforeSave: false });

        // Return the reset token so the client can call /reset-password/:token
        // We need the RAW token, but we only stored the hash.
        // So instead, generate a fresh one now that OTP is verified:
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 more minutes
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken: rawToken
        });

    } catch (error) {
        next(error);
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────
// Step 3: User provides new password + the reset token from Step 2
exports.resetPassword = async (req, res, next) => {
    try {
        const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashed,
            passwordResetExpires: { $gt: Date.now() }
        }).select("+passwordResetToken +passwordResetExpires");

        if (!user) {
            return res.status(400).json({ success: false, message: "Token is invalid or has expired" });
        }

        user.password = req.body.password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        const token = signToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, role: user.role }
        });

    } catch (error) {
        next(error);
    }
};