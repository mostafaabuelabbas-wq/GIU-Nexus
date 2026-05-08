const express = require('express');
const {
    getMyApplications,
    updateApplicationStatus,
    updateApplicationNotes,
    getAllApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management
 */

/**
 * @swagger
 * /api/v1/applications/my:
 *   get:
 *     summary: Get my applications (jobSeeker only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the current user's applications
 */
router.get('/my', protect, authorize('jobSeeker'), getMyApplications);

/**
 * @swagger
 * /api/v1/applications/{id}/status:
 *   patch:
 *     summary: Update application status (recruiter only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shortlisted, rejected]
 *     responses:
 *       200:
 *         description: Application status updated
 *       403:
 *         description: Not authorised
 */
router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

/**
 * @swagger
 * /api/v1/applications/{id}/notes:
 *   patch:
 *     summary: Update recruiter notes on an application (recruiter only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recruiterNotes]
 *             properties:
 *               recruiterNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notes updated
 */
router.patch('/:id/notes', protect, authorize('recruiter'), updateApplicationNotes);

/**
 * @swagger
 * /api/v1/applications:
 *   get:
 *     summary: Get all applications (admin only, paginated)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of all applications
 */
router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;
