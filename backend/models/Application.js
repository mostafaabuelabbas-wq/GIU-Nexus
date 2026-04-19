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
  }
);

module.exports = mongoose.model("Application", applicationSchema);