const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { slugify } = require("transliteration");

// ✅ Get blogs by user email
router.get("/user", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email query is required" });

  try {
    const blogs = await Blog.find({ email }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's blogs" });
  }
});

// ✅ Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
});

// ✅ Submit a new blog
router.post("/", async (req, res) => {
  const { title, author, content, email, category, photoUrl, community } =
    req.body;

  if (!title || !author || !content || !email || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Slugify: Handles Arabic + Latin titles
  let baseSlug = slugify(title)
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Fallback for pure Arabic (slugify might return empty)
  if (!baseSlug) baseSlug = `blog-${Date.now()}`;

  // Ensure uniqueness
  let slug = baseSlug;
  let counter = 1;

  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  try {
    const blog = new Blog({
      title,
      author,
      content,
      community,
      slug,
      photoUrl: photoUrl || "",
      email,
      category,
      likes: [],
      dislikes: [],
      views: 0,
      viewers: [],
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to post blog" });
  }
});

// ✅ Delete blog
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

// ✅ Increment views (once per user)
router.patch("/view/:slug", async (req, res) => {
  const { email } = req.body;
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (email && !blog.viewers.includes(email)) {
      blog.views += 1;
      blog.viewers.push(email);
      await blog.save();
    }

    res.json({ views: blog.views, viewers: blog.viewers });
  } catch (err) {
    res.status(500).json({ error: "Failed to update views" });
  }
});

// ✅ Like or unlike blog
router.patch("/like/:slug", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.likes.includes(email)) {
      blog.likes.pull(email); // Unlike
    } else {
      blog.likes.push(email); // Like
      blog.dislikes.pull(email); // Remove dislike if exists
    }

    await blog.save();
    res.json({
      likes: blog.likes,
      dislikes: blog.dislikes,
      likesCount: blog.likes.length,
      liked: blog.likes.includes(email),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update likes" });
  }
});

// ✅ Dislike or undo dislike
router.patch("/dislike/:slug", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.dislikes.includes(email)) {
      blog.dislikes.pull(email); // Undo dislike
    } else {
      blog.dislikes.push(email); // Dislike
      blog.likes.pull(email); // Remove like if exists
    }

    await blog.save();
    res.json({
      dislikes: blog.dislikes,
      likes: blog.likes,
      dislikesCount: blog.dislikes.length,
      disliked: blog.dislikes.includes(email),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update dislikes" });
  }
});

module.exports = router;
