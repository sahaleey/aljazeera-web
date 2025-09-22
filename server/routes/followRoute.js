const express = require("express");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
  getFollowersList, // --- ADD THIS ---
  getFollowingList, // --- ADD THIS ---
} = require("../controllers/followController.js");
const verifyUser = require("../middlewares/verifyUser.js");

const router = express.Router();

router.post("/:id/follow", verifyUser, followUser);
router.delete("/:id/unfollow", verifyUser, unfollowUser); // For RESTful APIs, DELETE is often preferred here

// Routes for getting COUNTS
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

// --- ADD THESE NEW ROUTES FOR GETTING THE ACTUAL LISTS ---
router.get("/:id/followers/list", getFollowersList);
router.get("/:id/following/list", getFollowingList);

router.get("/check/:id", verifyUser, checkFollowing);

module.exports = router;
