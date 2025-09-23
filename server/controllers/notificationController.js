// controllers/notificationController.js

const Notification = require("../models/Notification.js");
const mongoose = require("mongoose");

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("sender", "_id name photoUrl email")
      .populate("blog", "_id title slug");

    res.json(notifications);
  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all unread notifications as read
const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("Mark Notifications Read Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id; // assuming verifyToken middleware adds this
    await Notification.deleteMany({ userId });
    res
      .status(200)
      .json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    console.error("❌ Error clearing notifications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead,
  clearAllNotifications,
};
