const JobPost = require('../models/JobPost');
const Application = require('../models/Application');
const User = require('../models/User');

// GET /api/v1/jobs — Public
exports.getAllJobs = async (req, res, next) => {
  try {
    const { keyword, location, type, status, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }
    if (location) filter.location = new RegExp(location, 'i');
    if (type)     filter.type = type;
    if (status)   filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await JobPost.countDocuments(filter);
    const jobs  = await JobPost.find(filter).skip(skip).limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), jobs });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs/:id — Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/jobs/:id — Recruiter (owner only)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this job' });
    }

    const allowed = ['title', 'company', 'description', 'requirements',
                     'location', 'type', 'salary', 'totalSlots', 'status',
                     'deadline', 'experienceLevel', 'workMode'];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/jobs/:id — Recruiter (owner) OR Admin
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (req.user.role === 'recruiter') {
      if (job.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorised to delete this job' });
      }
    }

    await JobPost.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};
// POST /api/v1/jobs/:id/save — Job Seeker only
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Cannot save a closed job' });
    }

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedJobs.some(
      savedJobId => savedJobId.toString() === job._id.toString()
    );

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        savedJobId => savedJobId.toString() !== job._id.toString()
      );
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Job removed from saved',
        saved: false
      });
    }

    user.savedJobs.push(job._id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Job saved',
      saved: true
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/jobs/:jobId/apply — Job Seeker only
exports.applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await JobPost.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      coverLetter
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    next(err);
  }
};

// GET /api/v1/jobs/my-jobs — Recruiter only
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await JobPost.find({ createdBy: req.user._id });

    res.status(200).json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs/saved — Job Seeker only
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');

    res.status(200).json({ success: true, jobs: user.savedJobs });
  } catch (err) {
    next(err);
  }
};