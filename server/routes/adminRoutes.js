const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Blog = require("../models/Blog");
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyUser = require("../middlewares/verifyUser");

/**
 * ✅ Register a user after Firebase login
 * Public route: Adds user to MongoDB if not already there
 */
router.post("/register", verifyUser, async (req, res) => {
  try {
    const { name } = req.body;
    const email = req.firebaseUser.email;

    if (!email) {
      return res.status(400).json({ message: "📧 البريد الإلكتروني مطلوب" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        role: "user",
        blocked: false,
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "فشل تسجيل المستخدم" });
  }
});

/**
 * 🔍 Check if user is blocked (email-based)
 */
router.post("/check-blocked", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ blocked: user.blocked });
  } catch (err) {
    console.error("❌ Block check error:", err);
    res.status(500).json({ message: "فشل التحقق من حالة الحظر" });
  }
});

/**
 * 🔐 Get all users (only accessible by admin)
 */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "خطأ في تحميل المستخدمين" });
  }
});

/**
 * 🔍 Get current user (used to check block status)
 */
router.get("/me", verifyUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "❌ المستخدم غير موجود" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "فشل في جلب بيانات المستخدم" });
  }
});

/**
 * 🔄 Block / Unblock a user (admin only)
 */
router.put("/block/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "❗ المستخدم غير موجود" });
    }

    user.blocked = !user.blocked;
    await user.save();

    res.status(200).json({ success: true, blocked: user.blocked });
  } catch (err) {
    console.error("❌ Error blocking/unblocking user:", err);
    res.status(500).json({ message: "فشل في تحديث حالة المستخدم" });
  }
});

/**
 * 📚 Get all blogs (admin only)
 */
router.get("/blogs", verifyUser, verifyAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "email name");
    res.status(200).json(blogs);
  } catch (err) {
    console.error("❌ Error fetching blogs:", err);
    res.status(500).json({ message: "خطأ في تحميل المقالات" });
  }
});

/**
 * 🗑️ Delete a blog by ID (admin only)
 */
router.delete("/blogs/:id", verifyAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "❗ المقالة غير موجودة" });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting blog:", err);
    res.status(500).json({ message: "خطأ في حذف المقالة" });
  }
});

module.exports = router;
