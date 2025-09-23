// routes/notificationRoutes.js

const express = require("express");
const {
  getNotifications,
  markNotificationsAsRead,
  clearAllNotifications,
} = require("../controllers/notificationController.js");
const verifyUser = require("../middlewares/verifyUser.js");

const router = express.Router();

// --- PROTECTED ROUTES ---
// A user must be logged in to access their own notifications.

// GET /api/notifications - Fetches all notifications for the current user
router.get("/", verifyUser, getNotifications);

// PATCH /api/notifications/mark-read - Marks all notifications as read
// (PATCH is the correct verb for a partial update)
router.patch("/mark-read", verifyUser, markNotificationsAsRead);
router.delete("/clear-all", verifyUser, clearAllNotifications);

module.exports = router;
