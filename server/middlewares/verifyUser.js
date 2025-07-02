const admin = require("../firebaseAdmin");
const User = require("../models/User");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Check for Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "🚫 Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2️⃣ Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return res.status(400).json({ message: "❗ Email not found in token" });
    }

    // 3️⃣ Attach Firebase user to req for optional access
    req.firebaseUser = decodedToken;

    // 4️⃣ Bypass MongoDB check if it's the registration route
    if (req.path === "/register" && req.method === "POST") {
      return next();
    }

    // 5️⃣ Look for user in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "❗ User not found in database" });
    }

    // 6️⃣ Check if user is blocked
    if (user.blocked) {
      return res
        .status(403)
        .json({ message: "🚫 Your account has been blocked by admin" });
    }

    // 7️⃣ Attach MongoDB user to req for downstream use
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "🚫 Invalid or expired token" });
  }
};

module.exports = verifyUser;
