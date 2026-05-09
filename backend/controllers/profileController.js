const User = require("../models/User");
const hf = require("../services/hfService");

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    const editableFields = [
      "name",
      "bio",
      "profilePicture",
      "phone",
      "university",
      "major",
      "resumeUrl",
      "linkedinUrl",
      "githubUrl",
      "portfolioUrl",
      "studentId",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If a profile picture was uploaded, its Cloudinary URL takes precedence
    if (req.file) {
      updates.profilePicture = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.bio) {
      return res.status(400).json({
        success: false,
        message: "Bio is empty. Update your profile first.",
      });
    }

    const result = await hf.tokenClassification({
      model: "dslim/bert-base-NER",
      inputs: user.bio,
    });

    const skills = [
      ...new Set(
        result
          .filter((e) => ["B-MISC", "I-MISC", "B-ORG"].includes(e.entity_group))
          .map((e) => e.word)
      ),
    ];

    // Save extracted skills
    user.skills = skills;

    await user.save();

    // Cache the user's skills embedding for the recommendation engine
    try {
      const embResult = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: [skills.join(", ")],
      });
      await User.findByIdAndUpdate(user._id, { embedding: embResult[0] });
    } catch (embErr) {
      console.error("Failed to cache user embedding:", embErr.message);
    }

    res.status(200).json({
      success: true,
      skills: user.skills,
      extracted: skills,
    });
  } catch (error) {
    console.error("HF extraction failed:", error.message);

    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      skills: user?.skills || [],
      extracted: [],
      message: "AI extraction failed. Returning existing skills.",
    });
  }
};
