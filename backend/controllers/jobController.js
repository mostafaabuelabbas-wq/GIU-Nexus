const JobPost = require("../models/JobPost");
const Application = require("../models/Application");
const User = require("../models/User");
const hf = require("../services/hfService");

// POST /api/v1/jobs — Recruiter only
exports.createJob = async (req, res, next) => {
  try {
    // Check if recruiter is approved
    if (req.user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your account must be approved before posting jobs.",
      });
    }

    const {
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots,
    } = req.body;

    // AI Classification logic
    let category = "Other";
    try {
      const result = await hf.zeroShotClassification({
        model: "facebook/bart-large-mnli",
        inputs: [req.body.description],
        parameters: {
          candidate_labels: [
            "Frontend",
            "Backend",
            "AI/ML",
            "DevOps",
            "Data Engineering",
            "Other",
          ],
        },
      });
      category = result[0].labels[0];
    } catch (err) {
      console.error(
        "HF classification failed, defaulting to Other:",
        err.message,
      );
      // Fallback already set to 'Other'
    }

    const job = await JobPost.create({
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots,
      category,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs — Public
exports.getAllJobs = async (req, res, next) => {
  try {
    const { keyword, location, type, status, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (keyword) {
      const regex = new RegExp(keyword, "i");

      filter.$or = [{ title: regex }, { description: regex }];
    }

    if (location) {
      filter.location = new RegExp(location, "i");
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await JobPost.countDocuments(filter);

    const jobs = await JobPost.find(filter).skip(skip).limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs/:id — Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/jobs/:id — Recruiter (owner only)
exports.updateJob = async (req, res, next) => {
  try {
    if (req.user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account must be approved before managing jobs.",
      });
    }

    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to edit this job",
      });
    }

    const allowed = [
      "title",
      "company",
      "description",
      "requirements",
      "location",
      "type",
      "salary",
      "totalSlots",
      "status",
      "deadline",
      "experienceLevel",
      "workMode",
    ];

    const descriptionChanged = req.body.description !== undefined && req.body.description !== job.description;

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    if (descriptionChanged) {
      try {
        const result = await hf.zeroShotClassification({
          model: "facebook/bart-large-mnli",
          inputs: [job.description],
          parameters: {
            candidate_labels: [
              "Frontend",
              "Backend",
              "AI/ML",
              "DevOps",
              "Data Engineering",
              "Other",
            ],
          },
        });
        job.category = result[0].labels[0];
      } catch (err) {
        console.error("HF re-classification failed, keeping existing category:", err.message);
      }
    }

    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/jobs/:id — Recruiter (owner) OR Admin
exports.deleteJob = async (req, res, next) => {
  try {
    if (req.user.role === "recruiter" && req.user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account must be approved before managing jobs.",
      });
    }

    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (req.user.role === "recruiter") {
      if (job.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorised to delete this job",
        });
      }
    }

    await JobPost.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job deleted",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/jobs/:id/save — Job Seeker only
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Cannot save a closed job",
      });
    }

    const user = await User.findById(req.user._id);

    const alreadySaved = user.savedJobs.some(
      (savedJobId) => savedJobId.toString() === job._id.toString(),
    );

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        (savedJobId) => savedJobId.toString() !== job._id.toString(),
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Job removed from saved",
        saved: false,
      });
    }

    user.savedJobs.push(job._id);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Job saved",
      saved: true,
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
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications",
      });
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      coverLetter,
    });

    res.status(201).json({
      success: true,
      application,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    next(err);
  }
};

// GET /api/v1/jobs/my-jobs — Recruiter only
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await JobPost.find({
      createdBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs/saved — Job Seeker only
exports.getSavedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("savedJobs");

    res.status(200).json({
      success: true,
      jobs: user.savedJobs.filter((job) => job.status === "open"),
    });
  } catch (err) {
    next(err);
  }
};

// Cosine similarity helper function
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));

  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dot / (magA * magB);
}

// GET /api/v1/jobs/recommended — Job Seeker only
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    // Build user skills text
    const studentText = (req.user.skills || []).join(", ");

    // Fetch open jobs
    const jobs = await JobPost.find({
      status: "open",
    });

    // Build text for each job
    const jobTexts = jobs.map(
      (j) => j.title + " " + (j.requirements || []).join(", "),
    );

    // Call HuggingFace embeddings model
    const embeddings = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: [studentText, ...jobTexts],
    });

    // First vector belongs to student
    const studentVector = embeddings[0];

    // Score each job
    const scoredJobs = jobs.map((job, index) => {
      const similarity = cosineSimilarity(studentVector, embeddings[index + 1]);

      return {
        ...job.toObject(),
        score: similarity,
      };
    });

    // Sort descending
    scoredJobs.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      jobs: scoredJobs,
    });
  } catch (error) {
    console.error("HF recommendations failed:", error.message);

    // Graceful fallback
    const jobs = await JobPost.find({
      status: "open",
    });

    res.status(200).json({
      success: true,
      jobs,
    });
  }
};
