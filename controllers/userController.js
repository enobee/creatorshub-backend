const User = require("../models/User");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, country, profilePicture, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (bio) {
      user.bio = bio;
    }
    if (country) {
      user.country = country;
    }
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }
    if (Array.isArray(preferences)) {
      user.preferences = preferences;
    }

    const isNowComplete =
      user.bio && user.country && user.preferences && !user.isProfileComplete;

    if (isNowComplete) {
      user.isProfileComplete = true;
      user.credits += 20;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      profileCompleted: user.isProfileComplete,
      credits: user.credits,
      preferences: user.preferences,
    });
  } catch (error) {
    res
      .status(500)
      .json({ messgae: "Something went wrong", error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "credits lastLoginDate reportedFeeds"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date();
    const lastLogin = user.lastLoginDate || user.createdAt;
    const msPerDay = 1000 * 60 * 60 * 24;
    const loginStreak = Math.floor((today - lastLogin) / msPerDay);
    const reportedPosts = (user.reportedFeeds || []).length;

    res.json({
      totalCredits: user.credits,
      loginStreak,
      reportedPosts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching credits", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error in getProfile:", err);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

module.exports = { updateProfile, getUserStats, getProfile };
