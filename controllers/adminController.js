const User = require("../models/User");

const getUserCredits = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("name credits");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User credits fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        credits: user.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUserCredits = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (typeof amount !== "number") {
    return res.status(400).json({ message: "Amount must be a number" });
  }

  try {
    const user = await User.findById(userId).select("credit name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newCreditValue = user.credits + amount;
    if (newCreditValue < 0) {
      return res.status(400).json({ message: "Credits cannot go below zero" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: amount } },
      { new: true, select: "name credits" }
    );

    res.json({
      message: "User credits updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        credits: updatedUser.credits,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "_id name email role credits createdAt isProfileComplete lastLoginDate"
      )
      .lean();
    const formatted = users.map((user) => ({
      id: user._id,
      ...user,
      createdAt: user.createdAt,
      lastLoginDate: user.lastLoginDate,
    }));
    res.json({ users: formatted });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const getMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginDate: { $gte: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    });

    const totalCreditsAgg = await User.aggregate([
      { $group: { _id: null, sum: { $sum: "$credits" } } },
    ]);
    const totalCredits = totalCreditsAgg[0]?.sum || 0;

    const reportedAgg = await User.aggregate([
      {
        $project: {
          numReports: { $size: { $ifNull: ["$reportedFeeds", []] } },
        },
      },
      { $group: { _id: null, totalReports: { $sum: "$numReports" } } },
    ]);
    const reportedPosts = reportedAgg[0]?.totalReports || 0;

    res.json({
      totalUsers,
      activeUsers,
      totalCredits,
      reportedPosts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching metrics", error: error.message });
  }
};

module.exports = { getUserCredits, updateUserCredits, getUsers, getMetrics };
