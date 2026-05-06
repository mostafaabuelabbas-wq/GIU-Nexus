const express = require('express');

const {
    getMyApplications,
    updateApplicationStatus,
    getAllApplications
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, authorize('jobSeeker'), getMyApplications);

router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;