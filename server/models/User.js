const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    photoURL: { type: String, default: "" },
    role: { type: String, default: "user" },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
