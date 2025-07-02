const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User"); // MongoDB model

// 🔐 Verify Firebase token middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ REGISTER ROUTE
router.post("/register", verifyToken, async (req, res) => {
  const { email } = req.body;

  try {
    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      const newUser = new User({
        email,
        blocked: false,
        createdAt: new Date(),
      });

      await newUser.save();
      return res
        .status(201)
        .json({ message: "User registered", user: newUser });
    }

    res
      .status(200)
      .json({ message: "User already exists", user: existingUser });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
