const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getAdminStats } = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin dashboard endpoints
 */

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get platform-wide admin statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats object with usersByRole, jobsByStatus, appsByStatus, topJobs
 */
router.get("/stats", protect, authorize("admin"), getAdminStats);

module.exports = router;