const admin = require("../firebaseAdmin");
const User = require("../models/User");

const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🪵 Debug log: Show method and path
  console.log("🧪 [verifyUser]", req.method, req.path);

  // 1️⃣ Check if token is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("⛔ No token provided");
    return res
      .status(401)
      .json({ message: "🚫 Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2️⃣ Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;
    console.log("✅ Token verified for:", email);

    if (!email) {
      return res.status(400).json({ message: "❗ Email not found in token" });
    }

    // 3️⃣ Attach Firebase user info to req
    req.firebaseUser = decodedToken;

    // 4️⃣ Skip MongoDB check for registration route
    if (req.path === "/register" && req.method === "POST") {
      console.log("🔓 Registration bypass (no DB check)");
      return next();
    }

    // Step 5️⃣ MongoDB user fetch (but don't block req.user if not found!)
    const user = await User.findOne({ email });

    if (!user) {
      console.log("👤 User not found, auto-registering...");

      user = new User({
        email,
        name: decodedToken.name || email.split("@")[0],
        photoUrl: decodedToken.picture || "",
        password: "firebase-auto", // placeholder, can’t be used for login
        role: "user",
        blocked: false,
        createdAt: new Date(),
      });

      await user.save();
    }

    if (user.blocked) {
      console.log("🚫 Blocked user:", email);
      return res
        .status(403)
        .json({ message: "🚫 Your account has been blocked by admin" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "🚫 Invalid or expired token" });
  }
};

module.exports = verifyUser;
