// middlewares/verifyAdmin.js
const admin = require("../firebaseAdmin"); // ✅ import initialized instance

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "🚫 Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.admin) {
      return res.status(403).json({ message: "🚫 Forbidden - Admins only" });
    }

    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    res.status(401).json({ message: "🚫 Invalid or expired token" });
  }
};

module.exports = verifyAdmin;
