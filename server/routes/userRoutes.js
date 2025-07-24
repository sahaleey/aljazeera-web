const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User");
const verifyUser = require("../middlewares/verifyUser");
const bcrypt = require("bcryptjs");
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
    const { name, photoUrl, password } = req.body;
    const email = req.firebaseUser?.email;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "📧 البريد الإلكتروني وكلمة المرور مطلوبة" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      // 🆕 Create new user
      user = new User({
        email,
        password: hashedPassword,
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
      // Optionally update password if changed (be careful with this)
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      updated = true;
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
