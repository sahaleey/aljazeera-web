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

// ✅ Get all verified blogs
router.get("/verified", async (req, res) => {
  try {
    const verifiedBlogs = await Blog.find({ verified: true }).sort({
      createdAt: -1,
    });
    res.json(verifiedBlogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch verified blogs" });
  }
});

// ✅ Get points by community
router.get("/points", async (req, res) => {
  try {
    const verifiedBlogs = await Blog.find({ verified: true });

    const communityPoints = {};

    verifiedBlogs.forEach((blog) => {
      const key = blog.community.toLowerCase();
      if (!communityPoints[key]) communityPoints[key] = [];

      communityPoints[key].push(blog);
    });

    res.json(communityPoints); // now it's grouped blogs, not total points
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate community points" });
  }
});

// ✅ Submit a new blog
router.post("/", async (req, res) => {
  const { title, author, content, email, category, photoUrl, community } =
    req.body;

  if (!title || !author || !content || !email || !category || !community) {
    return res.status(400).json({ error: "All fields are required" });
  }

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
      verified: false,
      likes: [],
      dislikes: [],
      views: 0,
      viewers: [],
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to post blog" });
  }
});

// ✅ Fetch blog by slug
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blog" });
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

// ✅ Increment views
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

// ✅ Like / unlike
router.patch("/like/:slug", async (req, res) => {
  const { email } = req.body;
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

// ✅ Dislike / undo
router.patch("/dislike/:slug", async (req, res) => {
  const { email } = req.body;
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

// ✅ Admin: verify/unverify blog
router.patch("/:id/verify", async (req, res) => {
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
});

module.exports = router;
