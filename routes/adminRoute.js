const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const {
  getUserCredits,
  updateUserCredits,
  getUsers,
  getMetrics,
} = require("../controllers/adminController");

router.use(authenticateUser, authorizeRoles("admin"));

router.get("/metrics", getMetrics);

router.get("/users", getUsers);

router.get("/user/:userId/credits", getUserCredits);

router.put("/user/:userId/credits", updateUserCredits);

module.exports = router;
