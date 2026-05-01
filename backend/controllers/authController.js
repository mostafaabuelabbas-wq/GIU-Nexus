const User = require("../models/User");
const jwt = require("jsonwebtoken");

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
    return res.status(400).json({
        success: false,
        message: "Email already in use"
    });
}

        let status = null;
        if (role === "recruiter") status = "pending";
        if (role === "jobSeeker") status = "approved";
        

        const user = await User.create({
            name,
            email,
            password,
            role,
            status
        });
        

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
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
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