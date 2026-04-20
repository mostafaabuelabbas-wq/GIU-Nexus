const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // ← import at the top

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // ← never leaked in API responses
    },

    profilePicture: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    // Populated by Hugging Face NER model in Task 2
    // Example: ["react", "node.js", "mongodb"]
    extractedSkills: {  // ← renamed from "skills"
      type: [String],
      default: [],
    },

    role: {
      type: String,
      enum: {
        values: ["jobSeeker", "recruiter", "admin"],
        message: "Role must be one of: jobSeeker, recruiter, admin",
      },
      default: "jobSeeker",
    },

    // Only meaningful when role === "recruiter"
    // null for jobSeeker and admin
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be one of: pending, approved, rejected",
      },
      default: null, // ← fixed from "pending"
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ADDITIONS — practical fields for Tasks 2 & 3
    // ──────────────────────────────────────────────────────────────────────────

    // Student ID — useful for admin panel display and unique identification
    studentId: {
      type: String,
      trim: true,
      default: null,
    },

    // Phone number — recruiters need to contact shortlisted candidates
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // University & major — GIU Nexus is a university platform, recruiters filter by these
    university: {
      type: String,
      trim: true,
      default: null,
    },

    major: {
      type: String,
      trim: true,
      default: null,
    },

    // Resume/CV URL — students upload CV, recruiters download it from applicant profile
    resumeUrl: {
      type: String,
      default: null,
    },

    // External links — standard for any career platform
    linkedinUrl: {
      type: String,
      default: null,
    },

    githubUrl: {
      type: String,
      default: null,
    },

    portfolioUrl: {
      type: String,
      default: null,
    },

    // Saved/bookmarked jobs — students save jobs to apply later (Task 3 UI feature)
    savedJobs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "JobPost",
      default: [],
    },

    // Cached embedding vector from Hugging Face (Task 2)
    // Avoids re-calling the API on every recommendation request
    // Stored as array of numbers (e.g., 384-dim vector from all-MiniLM-L6-v2)
    embedding: {
      type: [Number],
      default: [],
      select: false, // large array, only fetch when needed for recommendations
    },

    // Password reset workflow (Task 2 — forgot password feature)
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // Track last login for admin analytics and "active users" stats
    lastLogin: {
      type: Date,
      default: null,
    },

    // Soft delete — never actually remove users, just mark them inactive
    // Preserves application history and recruiter job posts
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // ← gives createdAt AND updatedAt automatically
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 }); // Admin Panel: "show pending recruiters"
userSchema.index({ role: 1, isActive: 1 }); // Filter active users by role

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare password on login (used in Task 2 auth) ─────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);