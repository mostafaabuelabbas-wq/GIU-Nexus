const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant reference is required"],
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: [true, "Job post reference is required"],
    },

    coverLetter: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "shortlisted", "rejected"],
        message: "Status must be one of: pending, shortlisted, rejected",
      },
      default: "pending",
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ADDITIONS — practical fields for Tasks 2 & 3
    // ──────────────────────────────────────────────────────────────────────────

    // Recruiter notes — private notes when reviewing an applicant
    // Every real ATS (Applicant Tracking System) has this
    recruiterNotes: {
      type: String,
      trim: true,
      default: "",
    },

    // Who changed the status — tracks which recruiter reviewed the application
    // Useful for admin audit trail and multi-recruiter companies
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // When the status was last changed — separate from updatedAt
    // because updatedAt changes for any field edit, this only tracks status changes
    statusChangedAt: {
      type: Date,
      default: null,
    },

    // AI similarity score — cached from the recommendation engine (Task 2)
    // Shows how well this applicant matches the job, displayed in recruiter dashboard
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // Resume URL snapshot — captures the resume at time of application
    // Student might update their resume later, but recruiter sees what was submitted
    resumeSnapshot: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "appliedAt", updatedAt: true },
  }
);

// 🔥 Prevent duplicate applications
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

// 🚀 Recruiter dashboard optimization
applicationSchema.index({ job: 1, status: 1 });

// 🚀 Student dashboard optimization
applicationSchema.index({ user: 1, appliedAt: -1 });

// 🚀 Sort applicants by match score for a given job
applicationSchema.index({ job: 1, matchScore: -1 });

module.exports = mongoose.model("Application", applicationSchema);