const { getJobApplicants } = require('../controllers/applicationController');

const express = require('express');
const router = express.Router();

const { protect, authorize, optionalProtect } = require('../middleware/auth');

const {
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleSaveJob,
  applyToJob,
  getMyJobs,
  getSavedJobs,
  getRecommendedJobs,
  createJob,
  generateCoverLetter,
} = require('../controllers/jobController');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job post management & actions
 */

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: Get all jobs (public, filterable, paginated)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, internship]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Frontend, Backend, AI/ML, DevOps, Data Engineering, Other]
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [entry, mid, senior]
 *       - in: query
 *         name: workMode
 *         schema:
 *           type: string
 *           enum: [remote, hybrid, onsite]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of jobs
 */
router.get('/', optionalProtect, getAllJobs);

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Create a new job post (approved recruiter only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company, description, requirements, location, type]
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, internship]
 *               salary:
 *                 type: number
 *               totalSlots:
 *                 type: integer
 *               experienceLevel:
 *                 type: string
 *                 enum: [entry, mid, senior]
 *               workMode:
 *                 type: string
 *                 enum: [remote, hybrid, onsite]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created
 *       403:
 *         description: Account not approved
 */
router.post(
  '/',
  protect,
  authorize('recruiter'),
  createJob
);

/**
 * @swagger
 * /api/v1/jobs/my-jobs:
 *   get:
 *     summary: Get my job posts (recruiter only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recruiter's own job posts
 */
router.get(
  '/my-jobs',
  protect,
  authorize('recruiter'),
  getMyJobs
);

/**
 * @swagger
 * /api/v1/jobs/saved:
 *   get:
 *     summary: Get saved/bookmarked jobs (jobSeeker only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved open jobs
 */
router.get(
  '/saved',
  protect,
  authorize('jobSeeker'),
  getSavedJobs
);

/**
 * @swagger
 * /api/v1/jobs/recommended:
 *   get:
 *     summary: Get AI-recommended jobs based on skills (jobSeeker only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs ranked by similarity score
 */
router.get(
  '/recommended',
  protect,
  authorize('jobSeeker'),
  getRecommendedJobs
);

/**
 * @swagger
 * /api/v1/jobs/{jobId}/applicants:
 *   get:
 *     summary: Get applicants for a job (recruiter, owner only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applications for the job
 *       403:
 *         description: Not authorised
 */
router.get(
  '/:jobId/applicants',
  protect,
  authorize('recruiter'),
  getJobApplicants
);

/**
 * @swagger
 * /api/v1/jobs/{id}/save:
 *   post:
 *     summary: Toggle save/unsave a job (jobSeeker only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job saved or unsaved
 */
router.post(
  '/:id/save',
  protect,
  authorize('jobSeeker'),
  toggleSaveJob
);

/**
 * @swagger
 * /api/v1/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job (jobSeeker only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Already applied or job closed
 */
router.post(
  '/:jobId/apply',
  protect,
  authorize('jobSeeker'),
  applyToJob
);

router.post(
  '/:id/cover-letter',
  protect,
  authorize('jobSeeker'),
  generateCoverLetter
);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get a single job by ID (public)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:id', getJobById);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   patch:
 *     summary: Update a job post (recruiter, owner only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *               salary:
 *                 type: number
 *               totalSlots:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *     responses:
 *       200:
 *         description: Job updated
 *       403:
 *         description: Not authorised
 */
router.patch(
  '/:id',
  protect,
  authorize('recruiter'),
  updateJob
);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   delete:
 *     summary: Delete a job post (recruiter owner or admin)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted
 *       403:
 *         description: Not authorised
 */
router.delete(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  deleteJob
);


module.exports = router;