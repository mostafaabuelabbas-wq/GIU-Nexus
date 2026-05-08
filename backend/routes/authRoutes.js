const express = require("express");
const router = express.Router();
const { register, login, logout, forgotPassword, verifyOtp, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter, otpLimiter } = require("../middleware/rateLimiter");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & password management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [jobSeeker, recruiter]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post("/register", authLimiter, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", authLimiter, login);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent if email is registered (never reveals whether email exists)
 */
router.post("/forgot-password", authLimiter, forgotPassword);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify the OTP and receive a reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, returns resetToken
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", otpLimiter, verifyOtp);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password using the token from verify-otp
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful, returns new JWT
 *       400:
 *         description: Token is invalid or has expired
 */
router.patch("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out and invalidate the current JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", protect, logout);

module.exports = router;