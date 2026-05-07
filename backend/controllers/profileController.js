const User = require("../models/User");

// @desc    Get logged-in user profile
// @route   GET /api/v1/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    // req.user is already attached by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile details
// @route   PATCH /api/v1/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    // Allow updating ONLY specific fields and permit empty strings using undefined checks
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.bio !== undefined) updates.bio = req.body.bio;
    if (req.body.profilePicture !== undefined) updates.profilePicture = req.body.profilePicture;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PATCH /api/v1/profile/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Validation for missing fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // 2. Fetch user and handle "not found" case
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // 4. Set new password (pre-save hook in User.js will hash it automatically)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};