const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.followUser = async (req, res) => {
  try {
    const followingId = req.params.userId;

    // Check if user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: followingId
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Prevent self-follow
    if (followingId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const follow = new Follow({
      follower: req.user.id,
      following: followingId
    });

    await follow.save();

    // Create notification
    await Notification.create({
      recipient: followingId,
      sender: req.user.id,
      type: 'follow'
    });

    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user.id,
      following: req.params.userId
    });

    if (!follow) {
      return res.status(404).json({ error: 'Follow relationshi not found' });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: req.params.userId })
      .populate('follower', 'username name profilePicture bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: req.params.userId })
      .populate('following', 'username name profilePicture bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get users not already followed
    const following = await Follow.find({ follower: req.user.id }).select('following');
    
    const followingIds = following.map(f => f.following);
    followingIds.push(req.user.id); // Exclude self

    const suggestedUsers = await User.aggregate([
      { $match: { _id: { $nin: followingIds } } },
      { $sample: { size: limit } },
      { $project: { username: 1, name: 1, profilePicture: 1, bio: 1 } }
    ]);

    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};