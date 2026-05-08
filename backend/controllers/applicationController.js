const Application = require('../models/Application');
const JobPost = require('../models/JobPost');

exports.getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ user: req.user._id })
            .populate('job', 'title company type status');

        res.status(200).json({ success: true, applications });
    } catch (err) {
        next(err);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        if (req.user.status !== "approved") {
            return res.status(403).json({
                success: false,
                message: "Your account must be approved before managing applications."
            });
        }

        const { status } = req.body;

        const allowedStatuses = ['pending', 'shortlisted', 'rejected'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be pending, shortlisted, or rejected'
            });
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorised to update this application'
            });
        }

        const previousStatus = application.status;
        application.status = status;
        application.reviewedBy = req.user._id;
        application.statusChangedAt = new Date();
        await application.save();

        // Increment filledSlots when newly shortlisted; auto-close job if full
        if (status === 'shortlisted' && previousStatus !== 'shortlisted') {
            const job = application.job;
            job.filledSlots = (job.filledSlots || 0) + 1;
            if (job.filledSlots >= job.totalSlots) {
                job.status = 'closed';
            }
            await job.save();
        }

        // Decrement filledSlots when un-shortlisting; re-open job if slots free up
        if (previousStatus === 'shortlisted' && status !== 'shortlisted') {
            const job = application.job;
            job.filledSlots = Math.max(0, (job.filledSlots || 0) - 1);
            if (job.status === 'closed' && job.filledSlots < job.totalSlots) {
                job.status = 'open';
            }
            await job.save();
        }

        res.status(200).json({ success: true, application });
    } catch (err) {
        next(err);
    }
};

exports.updateApplicationNotes = async (req, res, next) => {
    try {
        const { recruiterNotes } = req.body;

        if (recruiterNotes === undefined) {
            return res.status(400).json({
                success: false,
                message: 'recruiterNotes field is required'
            });
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorised to add notes to this application'
            });
        }

        application.recruiterNotes = recruiterNotes;
        await application.save();

        res.status(200).json({ success: true, application });
    } catch (err) {
        next(err);
    }
};

exports.getAllApplications = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Application.countDocuments();

        const applications = await Application.find()
            .populate('user', 'name email')
            .populate('job', 'title company')
            .skip(skip)
            .limit(limit);

        res.status(200).json({ success: true, total, page, applications });
    } catch (err) {
        next(err);
    }
};

exports.getJobApplicants = async (req, res, next) => {
    try {
        if (req.user.status !== "approved") {
            return res.status(403).json({
                success: false,
                message: "Your account must be approved before managing applications."
            });
        }

        const { jobId } = req.params;

        const job = await JobPost.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorised to view applicants for this job'
            });
        }

        const applications = await Application.find({ job: jobId })
            .populate('user', 'name email skills');

        res.status(200).json({ success: true, applications });
    } catch (err) {
        next(err);
    }
};
