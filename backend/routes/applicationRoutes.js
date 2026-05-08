const express = require('express');

const {
    getMyApplications,
    updateApplicationStatus,
    updateApplicationNotes,
    getAllApplications
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, authorize('jobSeeker'), getMyApplications);

router.patch('/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

router.patch('/:id/notes', protect, authorize('recruiter'), updateApplicationNotes);

router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;