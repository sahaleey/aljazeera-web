const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User"); // MongoDB model

// 🔐 Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ REGISTER or UPDATE USER
router.post("/register", verifyToken, async (req, res) => {
  const { email, name, photoUrl } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email and name are required" });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // 🎉 New user registration
      user = new User({
        email,
        name,
        photoUrl: photoUrl || "", // fallback to empty string
        blocked: false,
        createdAt: new Date(),
      });

      await user.save();
      return res.status(201).json({ message: "User registered", user });
    }

    // 🔁 Existing user - update photo if needed
    let updated = false;
    if (photoUrl && user.photoUrl !== photoUrl) {
      user.photoUrl = photoUrl;
      updated = true;
    }

    if (updated) {
      await user.save();
    }

    return res.status(200).json({
      message: updated ? "User updated" : "User already exists",
      user,
    });
  } catch (err) {
    console.error("Error during user registration/update:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
