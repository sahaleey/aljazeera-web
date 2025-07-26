// middlewares/verifyAdmin.js

const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ message: "🚫 Forbidden - Admins only" });
  }

  next();
};

module.exports = verifyAdmin;
