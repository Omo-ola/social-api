const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/helpers");
const env = require("node:process");

exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }


    console.log("Req file", req.file);

    // Handle profile picture upload
    let profilePicture = "";
    if (req.file) {
      try {
        console.log("Attempting to upload");
        profilePicture = await uploadToCloudinary(req.file);
        console.log("File uploaded successfully");
      } catch (error) {
        console.error("file upload failed", error);
        return res.status(400).json({
          error: "profile picture upload failed",
          details: error.message,
        });
      }
    }

    // hash passwords
    const saltRound = 10;
    const hashPass = await bcrypt.hash(password, saltRound);

    // Create user
    const user = new User({
      username,
      email,
      password: hashPass,
      name,
      profilePicture,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);

    // Find user
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      createdAt: user.createdAt,
    };
    res.json({ token, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
