const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const now = new Date();
    const lastLogin = new Date(user.lastLoginDate || user.createdAt);
    const msPerDay = 1000 * 60 * 60 * 24;

    const daysSinceLastLogin = Math.floor((now - lastLogin) / msPerDay);

    if (daysSinceLastLogin >= 1) {
      user.credits += 5;

      // Login Streak logic
      if (daysSinceLastLogin === 1) {
        user.loginStreak = (user.loginStreak || 0) + 1;
      } else {
        user.loginStreak = 1;
      }

      user.lastLoginDate = now;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      credits: user.credits,
      loginStreak: user.loginStreak || 0,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.error({ loginUser: error.message });
  }
};

const promoteUser = async (req, res) => {
  const { userId } = req.params;
  const { secret } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: "Invalid admin secret" });
  }
  try {
    const user = await User.findById(userId).select("name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    user.role = "admin";
    await user.save();

    return res.json({
      message: "User role updated to admin",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  promoteUser,
};
