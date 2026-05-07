const { getJobApplicants } = require('../controllers/applicationController');
const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { getAllJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');

// Public routes
router.get('/', getAllJobs);
router.get('/:jobId/applicants', protect, authorize('recruiter'), getJobApplicants);
router.get('/:id', getJobById);

// Protected routes
router.patch('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;