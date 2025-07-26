const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "لم يتم إرسال التوكن" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("🧾 Decoded token:", decodedToken);

    // ❗ Check if admin claim exists
    if (!decodedToken.admin) {
      return res.status(403).json({ message: "🚫 ليس لديك صلاحيات المدير" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: true,
    };

    next();
  } catch (err) {
    console.error("🚫 Error verifying token:", err);
    res.status(403).json({ message: "توكن غير صالح" });
  }
};

module.exports = verifyToken;
