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

module.exports = router;
