const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: {
      type: [String],
      required: [true, "At least one requirement is needed"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Requirements array cannot be empty",
      },
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Job type is required"],
      enum: {
        values: ["full-time", "part-time", "internship"],
        message: "Type must be one of: full-time, part-time, internship",
      },
    },
    salary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: ["Frontend", "Backend", "AI/ML", "DevOps", "Data Engineering", "Other"],
        message: "{VALUE} is not a valid category",
      },
      default: "Other",
    },
    totalSlots: {
      type: Number,
      required: [true, "Total slots is required"],
      min: [1, "There must be at least one slot"],
    },
    status: {
      type: String,
      enum: {
        values: ["open", "closed"],
        message: "Status must be one of: open, closed",
      },
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job post must be linked to a recruiter"],
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ADDITIONS — practical fields for Tasks 2 & 3
    // ──────────────────────────────────────────────────────────────────────────

    // Track how many slots are filled — when filledSlots === totalSlots, auto-close
    // Incremented when a recruiter changes an application status to "shortlisted"
    filledSlots: {
      type: Number,
      default: 0,
      min: [0, "Filled slots cannot be negative"],
    },

    // Application deadline — jobs expire, students filter by "still open"
    deadline: {
      type: Date,
      default: null,
    },

    // Experience level — interns shouldn't see senior roles, recruiters specify this
    experienceLevel: {
      type: String,
      enum: {
        values: ["entry", "mid", "senior"],
        message: "Experience level must be one of: entry, mid, senior",
      },
      default: "entry",
    },

    // Work mode — post-COVID, the #1 filter on every job platform
    workMode: {
      type: String,
      enum: {
        values: ["remote", "hybrid", "onsite"],
        message: "Work mode must be one of: remote, hybrid, onsite",
      },
      default: "onsite",
    },

    // Cached embedding vector from Hugging Face (Task 2)
    // Used for recommendation engine — similarity between job embedding and user embedding
    // Stored as array of numbers (e.g., 384-dim vector from all-MiniLM-L6-v2)
    embedding: {
      type: [Number],
      default: [],
      select: false, // large array, only fetch when computing recommendations
    },

    // Number of applicants — cached count for recruiter dashboard display
    // Avoids running Application.countDocuments({ job: jobId }) on every page load
    applicantCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Soft delete — keep job data for analytics and application history
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
jobPostSchema.index({ status: 1, category: 1 });  // Browse/filter: "show open Frontend jobs"
jobPostSchema.index({ createdBy: 1 });              // Recruiter dashboard: "show my postings"
jobPostSchema.index({ createdAt: -1 });              // Default sort: newest jobs first
jobPostSchema.index({ status: 1, deadline: 1 });     // Filter: "open jobs not yet expired"
jobPostSchema.index({ experienceLevel: 1, workMode: 1 }); // Filter: "entry-level remote jobs"

module.exports = mongoose.model("JobPost", jobPostSchema);