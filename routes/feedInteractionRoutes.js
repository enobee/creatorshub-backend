const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  saveContent,
  shareContent,
  reportContent,
  getSavedPosts,
  unSavePost,
} = require("../controllers/feedInteractionController");

const router = express.Router();

router.use(authenticateUser);

router.post("/save", saveContent);

router.post("/share", shareContent);

router.post("/report", reportContent);

router.get("/saved-posts", getSavedPosts);

module.exports = router;
