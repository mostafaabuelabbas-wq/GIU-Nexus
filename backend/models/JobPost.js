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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobPost", jobPostSchema);