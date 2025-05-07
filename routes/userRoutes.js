const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  updateProfile,
  getUserStats,
  getProfile,
} = require("../controllers/userController");

router.use(authenticateUser);

router.get("/stats", getUserStats);
router.get("/profile", getProfile);

router.put("/update-profile", updateProfile);

module.exports = router;
