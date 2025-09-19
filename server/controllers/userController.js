const User = require("../models/User.js");
const Blog = require("../models/Blog.js");

const registerUser = async (req, res) => {
  const { name, email, photoUrl } = req.body;
  const firebaseUID = req.user.uid;
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { name, photoUrl, firebaseUID },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ _id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select(
      "-password"
    );
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) res.json({ blocked: user.blocked });
    else res.json({ blocked: false });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const blogs = await Blog.find({ email: user.email }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      name: user.name,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      blogs: blogs,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  getCurrentUser,
  getUserStatus,
  getUserProfile,
};
