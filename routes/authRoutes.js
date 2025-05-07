const express = require("express");
const {
  registerUser,
  loginUser,
  promoteUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/promote/:userId", promoteUser);

module.exports = router;
