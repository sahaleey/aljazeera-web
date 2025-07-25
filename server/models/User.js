const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    firebaseUID: {
      type: String,
      default: null,
    },
    loginMethod: {
      type: String,
      enum: ["firebase", "custom"],
      default: "firebase",
    },
    name: {
      type: String,
      required: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    photoUrl: { type: String, default: "" },
    role: { type: String, default: "user" },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
