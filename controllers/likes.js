const Like = require("../models/Like");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      user: req.user.id,
      post: postId,
    });

    if (existingLike) {
      return res.status(400).json({ error: "Post already liked" });
    }

    const like = new Like({
      user: req.user.id,
      post: postId,
    });

    await like.save();

    // Update post like count
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    // Create notification
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: "like",
        post: postId,
      });
    }

    res.status(201).json(like);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const like = await Like.findOneAndDelete({
      user: req.user.id,
      post: req.params.postId,
    });

    if (!like) {
      return res.status(404).json({ error: "Like not found" });
    }

    // Update post like count
    await Post.findByIdAndUpdate(like.post, { $inc: { likesCount: -1 } });

    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPostLikes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const likes = await Like.find({ post: req.params.postId })
      .populate("user", "username name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
