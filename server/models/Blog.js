const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  content: String,
  category: String,
  email: String,
  likes: {
    type: [String],
    default: [],
  },
  dislikes: {
    type: [String],
    default: [],
  },
  views: {
    type: Number,
    default: 0,
  },
  viewers: {
    type: [String],
    default: [],
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  photoUrl: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Blog", blogSchema);
