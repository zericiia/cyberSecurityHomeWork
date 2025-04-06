const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken'); // Add JWT for token generation
const {
  User,
  validateLoginUser,
  validateRegisterUser,
} = require("../models/user");

// Configure rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});

/**
 * @desc  Register New User
 * @route /api/auth/register
 * @method post
 * @access public
 *
 **/
router.post("/register", async (req, res) => {
  // Validation
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  // Querying DB
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: "This user already exists" });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // Create new user
    user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      isAdmin: req.body.isAdmin || false,
    });

    // Save user to DB
    const result = await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Exclude password from response
    const { password, ...userData } = result._doc;
    userData.token = token;

    // Send response
    res.status(201).json(userData);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

/**
 * @desc  Login
 * @route /api/auth/login
 * @method post
 * @access public
 *
 **/
router.post("/login", loginLimiter, async (req, res) => {
  // Validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  // Querying DB
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Exclude password from response
    const { password, ...userData } = user._doc;
    userData.token = token;

    // Send response
    res.status(200).json(userData);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

module.exports = router;