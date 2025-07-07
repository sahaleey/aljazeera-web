const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User");
const verifyUser = require("../middlewares/verifyUser");
// MongoDB model

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

router.post("/register", verifyUser, async (req, res) => {
  try {
    const { name, photoUrl } = req.body;
    const email = req.firebaseUser?.email;

    if (!email) {
      return res.status(400).json({ message: "📧 البريد الإلكتروني مطلوب" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // 🆕 Create new user
      user = new User({
        email,
        name,
        role: "user",
        blocked: false,
        photoUrl: photoUrl || "",
        createdAt: new Date(),
      });
      await user.save();
    } else {
      // 🔁 Update existing user (photo or name if changed)
      let updated = false;

      if (photoUrl && (!user.photoUrl || user.photoUrl !== photoUrl)) {
        user.photoUrl = photoUrl;
        updated = true;
      }

      if (name && user.name !== name) {
        user.name = name;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "فشل تسجيل المستخدم" });
  }
});

module.exports = router;
