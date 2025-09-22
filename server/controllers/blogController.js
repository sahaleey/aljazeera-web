const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const { slugify } = require("transliteration");

const getUserBlogs = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email query is required" });
  try {
    const blogs = await Blog.find({ email }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's blogs" });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

const getVerifiedBlogs = async (req, res) => {
  try {
    const verifiedBlogs = await Blog.find({ verified: true }).sort({
      createdAt: -1,
    });
    res.json(verifiedBlogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch verified blogs" });
  }
};

const getCommunityPoints = async (req, res) => {
  try {
    const verifiedBlogs = await Blog.find({ verified: true });
    const communityPoints = {};
    verifiedBlogs.forEach((blog) => {
      const key = blog.community.toLowerCase();
      if (!communityPoints[key]) communityPoints[key] = [];
      communityPoints[key].push(blog);
    });
    res.json(communityPoints);
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate community points" });
  }
};

const createBlog = async (req, res) => {
  const {
    title,
    author,
    authorId,
    content,
    email,
    category,
    photoUrl,
    community,
  } = req.body;
  if (
    !title ||
    !author ||
    !authorId ||
    !content ||
    !email ||
    !category ||
    !community
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    let baseSlug = slugify(title)
      .toLowerCase()
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!baseSlug) baseSlug = `blog-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    const blog = new Blog({
      title,
      author,
      authorId,
      content,
      community,
      slug,
      photoUrl: photoUrl || "",
      email,
      category,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to post blog" });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

const updateViews = async (req, res) => {
  const { email } = req.body;
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    if (email && !blog.viewers.includes(email)) {
      blog.views = (blog.views || 0) + 1;
      blog.viewers.push(email);
      await blog.save();
    }
    res.json({ views: blog.views });
  } catch (err) {
    res.status(500).json({ error: "Failed to update views" });
  }
};

const updateLikes = async (req, res) => {
  const email = req.user?.email; // trust verified user
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.likes.includes(email)) {
      blog.likes.pull(email);
    } else {
      blog.likes.push(email);
      blog.dislikes.pull(email);
    }

    await blog.save();
    res.json({ likes: blog.likes, dislikes: blog.dislikes });
  } catch (err) {
    res.status(500).json({ error: "Failed to update likes" });
  }
};

const updateDislikes = async (req, res) => {
  const email = req.user?.email; // use token info
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.dislikes.includes(email)) {
      blog.dislikes.pull(email);
    } else {
      blog.dislikes.push(email);
      blog.likes.pull(email);
    }

    await blog.save();
    res.json({ dislikes: blog.dislikes, likes: blog.likes });
  } catch (err) {
    res.status(500).json({ error: "Failed to update dislikes" });
  }
};

const verifyBlog = async (req, res) => {
  const { verified } = req.body;
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to verify blog" });
  }
};

const createComment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { content } = req.body;
    const { name, email, picture } = req.user;
    if (!content) {
      return res
        .status(400)
        .json({ message: "Comment content cannot be empty" });
    }
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const comment = new Comment({
      content,
      authorName: name,
      authorEmail: email,
      authorPhotoUrl: picture || "",
      blog: blog._id,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating comment" });
  }
};

const getCommentsForBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comments = await Comment.find({ blog: blog._id })
      .sort({ createdAt: "asc" })
      .lean();

    // Group replies under their parent
    const commentMap = {};
    comments.forEach((c) => {
      c.replies = [];
      commentMap[c._id] = c;
    });

    const topLevel = [];
    comments.forEach((c) => {
      if (c.parentComment) {
        if (commentMap[c.parentComment]) {
          commentMap[c.parentComment].replies.push(c);
        }
      } else {
        topLevel.push(c);
      }
    });

    res.status(200).json(topLevel);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Server error while fetching comments" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { slug, id } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // delete replies of this comment
    await Comment.deleteMany({ parentComment: comment._id });

    await Comment.findByIdAndDelete(id);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error while deleting comment" });
  }
};

const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userEmail = req.user.email;
    // Toggle the like
    if (comment.likes.includes(userEmail)) {
      // If already liked, remove the like (unlike)
      comment.likes.pull(userEmail);
    } else {
      // If not liked, add the like
      comment.likes.push(userEmail);
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// reply to a comment (nested comments)
const replyToComment = async (req, res) => {
  try {
    const { slug, id } = req.params; // blog slug + parent comment ID
    const { content } = req.body;
    const { name, email, picture } = req.user;

    if (!content) {
      return res.status(400).json({ message: "Reply content cannot be empty" });
    }

    const blog = await Blog.findOne({ slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const parentComment = await Comment.findById(id);
    if (!parentComment)
      return res.status(404).json({ message: "Parent comment not found" });

    const reply = new Comment({
      content,
      authorName: name,
      authorEmail: email,
      authorPhotoUrl: picture || "",
      blog: blog._id,
      parentComment: parentComment._id,
    });

    await reply.save();
    res.status(201).json(reply);
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ message: "Server error while creating reply" });
  }
};

// This ensures all functions are exported correctly
module.exports = {
  getUserBlogs,
  getAllBlogs,
  getVerifiedBlogs,
  getCommunityPoints,
  createBlog,
  getBlogBySlug,
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
};
