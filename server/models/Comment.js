const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    // Info about the person who wrote the comment
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    likes: {
      type: [String],
      default: [],
    },
    authorPhotoUrl: {
      type: String,
      default: "",
    },

    blog: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Blog", // This links it to your 'Blog' model
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // It's null if it's a top-level comment
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Comment", commentSchema);
