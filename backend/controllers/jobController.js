const JobPost = require('../models/JobPost');

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