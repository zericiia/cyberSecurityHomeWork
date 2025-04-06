const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Simulate a user database (in-memory)
const users = [];

// Simple validation functions
function validateRegisterUser(data) {
  const errors = [];
  if (!data.email || !data.password || !data.username) {
    errors.push("Email, username, and password are required.");
  }
  return { error: errors.length ? { details: errors.map(msg => ({ message: msg })) } : null };
}

function validateLoginUser(data) {
  const errors = [];
  if (!data.email || !data.password) {
    errors.push("Email and password are required.");
  }
  return { error: errors.length ? { details: errors.map(msg => ({ message: msg })) } : null };
}

/**
 * @desc  Register New User
 * @route /api/auth/register
 * @method post
 * @access public
 */
router.post("/register", async (req, res) => {
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  try {
    const existingUser = users.find((u) => u.email === req.body.email);
    if (existingUser) {
      return res.status(400).json({ message: "This user already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = {
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
      isAdmin: req.body.isAdmin || false,
    };

    users.push(newUser);

    const token = jwt.sign({ email: newUser.email }, "secretkey", { expiresIn: "1h" });

    const { password, ...userData } = newUser;
    userData.token = token;

    res.status(201).json(userData);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

/**
 * @desc  Login
 * @route /api/auth/login
 * @method post
 * @access public
 */
router.post("/login", async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  try {
    const user = users.find((u) => u.email === req.body.email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ email: user.email }, "secretkey", { expiresIn: "1h" });

    const { password, ...userData } = user;
    userData.token = token;

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

module.exports = router;
