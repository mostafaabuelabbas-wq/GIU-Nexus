const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../services/emailService");

const signToken = (id, role) => {
    return jwt.sign(
        { _id: id, role: role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// ─── REGISTER ────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: "Please provide name, email, password, and role" });
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
                skills: user.extractedSkills
            }
        });

    } catch (error) {
        next(error);
    }
};

// ─── LOGOUT ────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        // Always return 200 — never reveal if email exists or not
        if (!user) {
            return res.status(200).json({ success: true, message: "Password reset email sent" });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.passwordResetToken = hashed;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save({ validateBeforeSave: false });

        const resetLink = `http://localhost:5000/api/v1/auth/reset-password/${rawToken}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Click the link below to reset your password (expires in 10 minutes):\n\n${resetLink}\n\nIf you did not request this, ignore this email.`
        });

        res.status(200).json({ success: true, message: "Password reset email sent" });

    } catch (error) {
        next(error);
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────
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