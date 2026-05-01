const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
} = require("../controllers/userController");

router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;