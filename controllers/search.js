
const User = require("../models/User");
const Post = require("../models/Post");

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .select("username name profilePicture bio")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .populate("user", "username name profilePicture")
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.globalSearch = async (req, res) => {
  try {
    const { query } = req.query;
    const limit = parseInt(req.query.limit) || 5;

    const [users, posts] = await Promise.all([
      User.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .select("username name profilePicture bio")
        .sort({ score: { $meta: "textScore" } })
        .limit(limit),

      Post.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .populate("user", "username name profilePicture")
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .limit(limit),
    ]);

    res.json({ users, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};