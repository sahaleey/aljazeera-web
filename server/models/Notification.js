// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["new_blog", "like", "follow"],
      required: true,
    },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
    isRead: { type: Boolean, default: false, index: true },

    // notificationsEnabled field is removed from here
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
