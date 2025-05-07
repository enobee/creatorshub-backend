const User = require("../models/User");

const saveContent = async (req, res) => {
  const { postId, source, title, url } = req.body;

  if (!postId || !source || !url) {
    return res.status(400).json({ message: "postId, source & url required" });
  }
  try {
    const update = {
      $push: {
        savedFeeds: { postId, source, title, url, date: new Date() },
      },
      $inc: { credits: 5 },
    };

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      select: "savedFeeds credits",
    });

    res.json({
      message: "Content shared 5 credits earned",
      sharedFeeds: user.sharedFeeds,
      credits: user.credits,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving content", error: error.message });
  }
};

const shareContent = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: "url required" });
  }
  try {
    const update = {
      $push: {
        sharedFeeds: { url, date: new Date() },
      },
      $inc: { credits: 2 },
    };
    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      select: "sharedFeeds credits",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sharing content", error: error.message });
  }
};

const reportContent = async (req, res) => {
  const { postId, source, title, url } = req.body;

  if (!postId || !source || !url) {
    return res.status(400).json({ message: "postId, source & url required" });
  }

  try {
    const update = {
      $push: {
        reportedFeeds: { postId, source, title, url, date: new Date() },
      },
      $inc: { credits: 2 },
    };

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      select: "reportedFeeds credits",
    });

    res.json({
      message: "Content reported 2 credits earned",
      reportedFeeds: user.reportedFeeds,
      credits: user.credits,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error reporting content", error: error.message });
  }
};

// backend/controllers/feedInteractionController.js

const getSavedPosts = async (req, res) => {
  try {
    // Fetch only the savedFeeds field
    const user = await User.findById(req.user.id).select("savedFeeds").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = Array.isArray(user.savedFeeds) ? user.savedFeeds : [];

    return res.json({ posts });
  } catch (err) {
    console.error("Error in getSavedPosts:", err);
    return res
      .status(500)
      .json({ message: "Error fetching saved posts", error: err.message });
  }
};

module.exports = {
  saveContent,
  shareContent,
  reportContent,
  getSavedPosts,
};
