const { getJobApplicants } = require('../controllers/applicationController');

const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleSaveJob,
  applyToJob,
  getMyJobs,
  getSavedJobs,
  getRecommendedJobs
} = require('../controllers/jobController');


// Public routes
router.get('/', getAllJobs);


// Protected routes BEFORE /:id

router.get(
  '/my-jobs',
  protect,
  authorize('recruiter'),
  getMyJobs
);

router.get(
  '/saved',
  protect,
  authorize('jobSeeker'),
  getSavedJobs
);

// AI recommendations route
router.get(
  '/recommended',
  protect,
  authorize('jobSeeker'),
  getRecommendedJobs
);

router.get(
  '/:jobId/applicants',
  protect,
  authorize('recruiter'),
  getJobApplicants
);

router.post(
  '/:id/save',
  protect,
  authorize('jobSeeker'),
  toggleSaveJob
);

router.post(
  '/:jobId/apply',
  protect,
  authorize('jobSeeker'),
  applyToJob
);


// Public single job route
router.get('/:id', getJobById);


// Protected update/delete routes
router.patch(
  '/:id',
  protect,
  authorize('recruiter'),
  updateJob
);

router.delete(
  '/:id',
  protect,
  authorize('recruiter', 'admin'),
  deleteJob
);


module.exports = router;