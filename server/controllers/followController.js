const Follow = require("../models/Follow.js");
const mongoose = require("mongoose");

// Follow a user
const followUser = async (req, res) => {
  const followerId = new mongoose.Types.ObjectId(req.user.id);
  const { id: followingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (followerId.equals(followingId)) {
    return res.status(400).json({ message: "لا يمكنك متابعة نفسك" });
  }

  try {
    const existing = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (existing) {
      return res.status(400).json({ message: "أنت تتابع هذا المستخدم بالفعل" });
    }

    await Follow.create({ follower: followerId, following: followingId });
    res.json({ message: "تم المتابعة بنجاح" });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "خطأ في المتابعة" });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  const followerId = new mongoose.Types.ObjectId(req.user.id);
  const { id: followingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const deleted = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "لم تكن تتابع هذا المستخدم" });
    }

    res.json({ message: "تم إلغاء المتابعة" });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "خطأ في إلغاء المتابعة" });
  }
};

// Get followers count
const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const count = await Follow.countDocuments({ following: id });
    res.json({ followers: count });
  } catch (err) {
    console.error("Followers count error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get following count
const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const count = await Follow.countDocuments({ follower: id });
    res.json({ following: count });
  } catch (err) {
    console.error("Following count error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Check if current user follows another
const checkFollowing = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { id: followingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(followingId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    res.json({ isFollowing: !!follow });
  } catch (err) {
    console.error("Check following error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get the list of users who are followers
const getFollowersList = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate(
      "follower",
      "_id name photoUrl email"
    );

    const followers = follows.map((follow) => follow.follower);

    res.json(followers);
  } catch (err) {
    console.error("Get followers list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get the list of users that `userId` is following
const getFollowingList = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate(
      "following",
      "_id name photoUrl email"
    );

    const following = follows.map((follow) => follow.following);

    res.json(following);
  } catch (err) {
    console.error("Get following list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
  getFollowersList,
  getFollowingList,
};
