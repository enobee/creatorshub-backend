const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
    },
    bio: {
      type: String,
    },
    country: {
      type: String,
    },
    preferences: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    credits: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    savedFeeds: {
      type: [
        {
          postId: String,
          source: String,
          title: String,
          url: String,
          date: Date,
        },
      ],
      default: [],
    },
    sharedFeeds: {
      type: [
        {
          url: String,
          date: Date,
        },
      ],
      default: [],
    },
    reportedFeeds: {
      type: [
        {
          postId: String,
          source: String,
          title: String,
          url: String,
          date: Date,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
