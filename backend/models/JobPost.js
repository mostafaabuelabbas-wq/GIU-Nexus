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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobPost", jobPostSchema);