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

module.exports = mongoose.model("Application", applicationSchema);
