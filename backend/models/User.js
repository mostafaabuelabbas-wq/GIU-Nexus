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
  },
  {
    timestamps: true, // ← gives createdAt AND updatedAt automatically
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 }); // Admin Panel: "show pending recruiters"

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