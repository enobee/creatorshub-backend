const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { getFeed } = require("../controllers/feedController");

router.get("/personalized", authenticateUser, getFeed);

module.exports = router;
