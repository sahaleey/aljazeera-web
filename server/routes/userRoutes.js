const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const {
  registerUser,
  getCurrentUser,
  getUserStatus,
  getUserProfile,
} = require("../controllers/userController.js");

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
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// --- Private Routes ---
router.post("/register", verifyToken, registerUser);
router.get("/me", verifyToken, getCurrentUser);

// --- Public Routes ---
router.get("/status/:email", getUserStatus);
router.get("/profile/:email", getUserProfile);

module.exports = router;
