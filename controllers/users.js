const User = require("../models/User");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = { name, bio };

    // Handle profile picture update
    if (req.file) {
      updates.profilePicture = await uploadToCloudinary(req.file);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User nt found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: "" },
      { new: true }
    ).select("-password");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
