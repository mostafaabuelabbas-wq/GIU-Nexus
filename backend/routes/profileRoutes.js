const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills,
} = require("../controllers/profileController");

const { protect, authorize } = require("../middleware/auth");

// All routes in this file require authentication
router.get("/", protect, getProfile);

router.patch("/", protect, updateProfile);

router.patch("/change-password", protect, changePassword);

// AI skill extraction route
router.post(
  "/extract-skills",
  protect,
  authorize("jobSeeker"),
  extractSkills
);

module.exports = router;