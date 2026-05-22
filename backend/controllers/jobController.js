const JobPost = require("../models/JobPost");
const Application = require("../models/Application");
const User = require("../models/User");
const hf = require("../services/hfService");

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

async function classifyJobCategory(description) {
  try {
    return await hf.classifyJobZeroShot(description, 90000);
  } catch (firstErr) {
    console.error("HF classification attempt 1 failed:", firstErr.message, "— retrying in 2s");
    await new Promise((r) => { const t = setTimeout(r, 2000); if (t.unref) t.unref(); });
    try {
      return await hf.classifyJobZeroShot(description, 90000);
    } catch (secondErr) {
      console.error("HF classification attempt 2 failed:", secondErr.message, "— defaulting to Other");
      return "Other";
    }
  }
}
// POST /api/v1/jobs — Recruiter only (approved)
exports.createJob = async (req, res, next) => {
  try {
    // Check if recruiter is approved
    if (req.user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is pending approval. Wait for admin approval before posting jobs.",
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
      experienceLevel,
      workMode,
      deadline,
    } = req.body;

    const job = await JobPost.create({
      title,
      company,
      description,
      requirements,
      location,
      type,
      salary,
      totalSlots,
      category: "Classifying...",
      createdBy: req.user._id,
      ...(experienceLevel && { experienceLevel }),
      ...(workMode && { workMode }),
      ...(deadline && { deadline }),
    });

    res.status(201).json({ success: true, job });

    // Background: classify then update category. Exposed via app.locals so tests
    // can await it deterministically without flaky setTimeouts.
    const classifyInput = `${title}\n${description}\nSkills: ${(requirements || []).join(', ')}`;
    const classifyPromise = classifyJobCategory(classifyInput)
      .then((category) => JobPost.findByIdAndUpdate(job._id, { category }))
      .catch((err) => console.error("Background classification failed:", err.message));
    req.app.locals.pendingJobs = (req.app.locals.pendingJobs || []).concat(classifyPromise);

    // Background: cache embedding
    hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: [title + " " + (requirements || []).join(", ")],
    }).then((embResult) => JobPost.findByIdAndUpdate(job._id, { embedding: embResult[0] }))
      .catch((err) => console.error("Failed to cache job embedding:", err.message));
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/jobs — Public
exports.getAllJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      type,
      status,
      category,
      experienceLevel,
      workMode,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }
    if (location) filter.location = new RegExp(location, "i");
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (workMode) filter.workMode = workMode;

    if (req.user?.role === 'jobSeeker') {
      const applied = await Application.find({ user: req.user._id }).select('job');
      const appliedIds = applied.map(a => a.job);
      if (appliedIds.length) filter._id = { $nin: appliedIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await JobPost.countDocuments(filter);
    const jobs = await JobPost.find(filter).skip(skip).limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), jobs });
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
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, job });
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
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised to edit this job" });
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

    const descriptionChanged =
      req.body.description !== undefined &&
      req.body.description !== job.description;

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    if (descriptionChanged) {
      try {
        const classifyInput = `${job.title}\n${job.description}\nSkills: ${(job.requirements || []).join(', ')}`;
        const result = await hf.zeroShotClassification({
          model: "facebook/bart-large-mnli",
          inputs: classifyInput,
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
        job.category = result[0].label;
      } catch (err) {
        console.error(
          "HF re-classification failed, keeping existing category:",
          err.message,
        );
      }
    }

    await job.save();

    if (
      req.body.description !== undefined ||
      req.body.requirements !== undefined
    ) {
      try {
        const embResult = await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: [job.title + " " + (job.requirements || []).join(", ")],
        });
        await JobPost.findByIdAndUpdate(job._id, { embedding: embResult[0] });
      } catch (embErr) {
        console.error("Failed to update job embedding:", embErr.message);
      }
    }

    res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/jobs/:id — Recruiter (owner) or Admin
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
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (
      req.user.role === "recruiter" &&
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised to delete this job" });
    }

    await JobPost.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/jobs/:id/save — Job Seeker only
exports.toggleSaveJob = async (req, res, next) => {
  try {
    const job = await JobPost.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== "open") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot save a closed job" });
    }

    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedJobs.some(
      (id) => id.toString() === job._id.toString(),
    );

    if (alreadySaved) {
      user.savedJobs = user.savedJobs.filter(
        (id) => id.toString() !== job._id.toString(),
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
    res.status(200).json({ success: true, message: "Job saved", saved: true });
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
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const resumeSnapshot = req.user.resumeUrl || null;

    let matchScore = null;
    try {
      const userText = (req.user.skills || []).join(", ");
      const jobText = job.title + " " + (job.requirements || []).join(", ");

      if (userText.trim()) {
        const embeddings = await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: [userText, jobText],
        });
        const similarity = cosineSimilarity(embeddings[0], embeddings[1]);
        matchScore = Math.round(Math.max(0, Math.min(1, similarity)) * 100);
      }
    } catch (err) {
      console.error("Match score computation failed:", err.message);
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
      resumeSnapshot,
      matchScore,
    });

    await JobPost.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    res.status(201).json({ success: true, application });
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
    const jobs = await JobPost.find({ createdBy: req.user._id }).lean();
    const jobIds = jobs.map((j) => j._id);

    // Compute applicant count live from the Applications collection so the
    // dashboard never depends on the cached `applicantCount` being in sync.
    const counts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const jobsWithCounts = jobs.map((j) => ({
      ...j,
      applicantCount: countMap.get(String(j._id)) || 0,
    }));

    res.status(200).json({ success: true, jobs: jobsWithCounts });
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

// GET /api/v1/jobs/recommended — Job Seeker only
exports.getRecommendedJobs = async (req, res, next) => {
  try {
    if (!req.user.skills || req.user.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No skills extracted yet. Add a bio and extract skills first.',
      });
    }

    const studentText = (req.user.skills || []).join(", ");

    const applied = await Application.find({ user: req.user._id }).select('job');
    const appliedIds = applied.map(a => a.job);

    const [userFull, jobs] = await Promise.all([
      User.findById(req.user._id).select("+embedding"),
      JobPost.find({ status: "open", ...(appliedIds.length && { _id: { $nin: appliedIds } }) }).select("+embedding"),
    ]);

    if (jobs.length === 0) {
      return res.status(200).json({ success: true, jobs: [] });
    }

    const toEmbed = [];
    let userEmbedIdx = -1;
    const jobEmbedIdxMap = {};

    if (!userFull.embedding || userFull.embedding.length === 0) {
      userEmbedIdx = toEmbed.length;
      toEmbed.push(studentText);
    }

    jobs.forEach((job) => {
      if (!job.embedding || job.embedding.length === 0) {
        jobEmbedIdxMap[job._id.toString()] = toEmbed.length;
        toEmbed.push(job.title + " " + (job.requirements || []).join(", "));
      }
    });

    let freshVectors = [];
    if (toEmbed.length > 0) {
      freshVectors = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: toEmbed,
      });

      if (userEmbedIdx !== -1) {
        User.findByIdAndUpdate(req.user._id, {
          embedding: freshVectors[userEmbedIdx],
        }).catch(() => {});
      }
      jobs.forEach((job) => {
        const idx = jobEmbedIdxMap[job._id.toString()];
        if (idx !== undefined) {
          JobPost.findByIdAndUpdate(job._id, {
            embedding: freshVectors[idx],
          }).catch(() => {});
        }
      });
    }

    const userVector =
      userEmbedIdx !== -1 ? freshVectors[userEmbedIdx] : userFull.embedding;

    const scoredJobs = jobs.map((job) => {
      const idx = jobEmbedIdxMap[job._id.toString()];
      const jobVector = idx !== undefined ? freshVectors[idx] : job.embedding;
      const similarity = Math.max(0, cosineSimilarity(userVector, jobVector));
      return { ...job.toObject(), score: similarity };
    });

    scoredJobs.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, jobs: scoredJobs });
  } catch (error) {
    console.error("HF recommendations failed:", error.message);
    const applied = await Application.find({ user: req.user._id }).select('job').catch(() => []);
    const appliedIds = applied.map(a => a.job);
    const jobs = await JobPost.find({ status: "open", ...(appliedIds.length && { _id: { $nin: appliedIds } }) });
    res.status(200).json({ success: true, jobs });
  }
};
