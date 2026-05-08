const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills,
} = require("../controllers/profileController");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Current user's profile management
 */

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get("/", protect, getProfile);

/**
 * @swagger
 * /api/v1/profile:
 *   patch:
 *     summary: Update profile fields (optionally upload a profile picture)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg/jpeg/png, max 2 MB). When provided its Cloudinary URL overwrites the stored profilePicture.
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               university:
 *                 type: string
 *               major:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               studentId:
 *                 type: string
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               university:
 *                 type: string
 *               major:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid file type or file too large
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */
router.patch("/", protect, upload.single("profilePicture"), updateProfile);

/**
 * @swagger
 * /api/v1/profile/change-password:
 *   patch:
 *     summary: Change the current user's password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 */
router.patch("/change-password", protect, changePassword);

/**
 * @swagger
 * /api/v1/profile/extract-skills:
 *   post:
 *     summary: Extract skills from bio using AI (jobSeeker only)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Extracted skills list
 *       400:
 *         description: Bio is empty
 */
router.post(
  "/extract-skills",
  protect,
  authorize("jobSeeker"),
  extractSkills
);

module.exports = router;