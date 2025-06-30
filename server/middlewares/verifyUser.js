// middlewares/verifyUser.js
const admin = require("../firebaseAdmin");
const User = require("../models/User");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "🚫 Unauthorized - No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "❗ User not found" });
    }

    if (user.blocked) {
      return res
        .status(403)
        .json({ message: "🚫 Your account has been blocked" });
    }

    req.user = user; // Save user for later use if needed
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "🚫 Invalid or expired token" });
  }
};

module.exports = verifyUser;
