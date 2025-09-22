const express = require("express");
const router = express.Router();

const {
  getUserBlogs,
  getAllBlogs,
  getVerifiedBlogs,
  getCommunityPoints,
  getBlogBySlug,
  createBlog,
  deleteBlog,
  updateViews,
  updateLikes,
  updateDislikes,
  verifyBlog,
  createComment,
  getCommentsForBlog,
  deleteComment,
  likeComment,
  replyToComment,
} = require("../controllers/blogController.js");

// Import your correct middleware files
const verifyUser = require("../middlewares/verifyUser");
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyToken = require("../middlewares/verifyToken");

// --- Main Blog Routes ---

router.route("/").get(getAllBlogs).post(verifyUser, createBlog);

// --- Specific Routes (come before dynamic /:slug) ---
router.route("/user").get(getUserBlogs);
router.route("/verified").get(getVerifiedBlogs);
router.route("/points").get(getCommunityPoints);

// --- Comment Routes (specific to a slug) ---

router
  .route("/:slug/comments")
  .get(getCommentsForBlog)
  .post(verifyUser, createComment);

// --- Interaction Routes ---
router.route("/view/:slug").patch(updateViews);
router.route("/like/:slug").patch(verifyUser, updateLikes);
router.route("/:slug/comments/:id/like").patch(verifyUser, likeComment);
router.route("/dislike/:slug").patch(verifyUser, updateDislikes);

// --- Dynamic & Admin Routes (come last) ---
router.route("/:slug").get(getBlogBySlug);
router.route("/:id").delete(verifyUser, deleteBlog);
router.route("/:id/verify").patch(verifyUser, verifyAdmin, verifyBlog);
router.delete("/:slug/comments/:id", verifyUser, deleteComment);
router.delete("/:slug/comments/:id/replies/:id", verifyUser, deleteComment);
router.patch("/:slug/comments/:id/like", verifyUser, likeComment);
router.post("/:slug/comments/:id/reply", verifyUser, replyToComment);

module.exports = router;
