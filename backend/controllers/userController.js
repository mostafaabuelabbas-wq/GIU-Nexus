const User = require("../models/User");
const JobPost = require("../models/JobPost");
const Application = require("../models/Application");

// @desc    Get all users (filterable, paginated)
// @route   GET /api/v1/users
// @access  Admin only
const getAllUsers = async (req, res, next) => {
    try {
        const { role, status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({ success: true, total, page: parseInt(page), users });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single user by ID
// @route   GET /api/v1/users/:id
// @access  Admin only
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user status (approve/reject/pending)
// @route   PATCH /api/v1/users/:id/status
// @access  Admin only
const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be one of: approved, rejected, pending",
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.status = status;
        await user.save();

        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user permanently
// @route   DELETE /api/v1/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (err) {
        next(err);
    }
};

// @desc    Get platform-wide admin stats
// @route   GET /api/v1/admin/stats
// @access  Admin only
const getAdminStats = async (req, res, next) => {
    try {
        const usersByRoleRaw = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]);
        const usersByRole = usersByRoleRaw.reduce((acc, { _id, count }) => {
            if (_id) acc[_id] = count;
            return acc;
        }, {});

        const jobsByStatusRaw = await JobPost.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const jobsByStatus = jobsByStatusRaw.reduce((acc, { _id, count }) => {
            if (_id) acc[_id] = count;
            return acc;
        }, {});

        const appsByStatusRaw = await Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const appsByStatus = appsByStatusRaw.reduce((acc, { _id, count }) => {
            if (_id) acc[_id] = count;
            return acc;
        }, {});

        const topJobs = await Application.aggregate([
            { $group: { _id: "$job", applicationCount: { $sum: 1 } } },
            { $sort: { applicationCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "jobposts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "jobDetails",
                },
            },
            { $unwind: "$jobDetails" },
            {
                $project: {
                    _id: 1,
                    applicationCount: 1,
                    title: "$jobDetails.title",
                    company: "$jobDetails.company",
                },
            },
        ]);

        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        const applicationsPerWeek = await Application.aggregate([
            { $match: { appliedAt: { $gte: fourWeeksAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: {
                                $dateTrunc: { date: "$appliedAt", unit: "week", startOfWeek: "monday" }
                            }
                        }
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, week: "$_id", count: 1 } },
        ]);

        res.status(200).json({
            success: true,
            stats: { usersByRole, jobsByStatus, appsByStatus, topJobs, applicationsPerWeek },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllUsers, getUserById, updateUserStatus, deleteUser, getAdminStats };