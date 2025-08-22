const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Follow = require("../models/Follow");
const { uploadToCloudinary } = require("../utils/helpers");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let media = "";

    if (req.file) {
      media = await uploadToCloudinary(req.file);
    }

    const post = new Post({
      user: req.user.id,
      content,
      media,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "username name profilePicture"
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users the current user is following
    const following = await Follow.find({ follower: req.user.id }).select(
      "following"
    );

    const followingIds = following.map((f) => f.following);
    followingIds.push(userId); // Include own posts

    const posts = await Post.find({ user: { $in: followingIds } })
      .populate("user", "username name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error("Error in getFeed", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!post) {
      return res
        .status(404)
        .json({ error: "Post not found or not authorized" });
    }

    // Clean up related data
    await Like.deleteMany({ post: post._id });
    await Comment.deleteMany({ post: post._id });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
