const express = require("express");
const router = express.Router();

// Import all route files
const authRoutes = require("./auth");
const userRoutes = require("./users");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const likeRoutes = require("./likes");
const followRoutes = require("./follows");
const chatRoutes = require("./chats");
const notificationRoutes = require("./notifications");
const searchRoutes = require("./search");

// Use routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/likes", likeRoutes);
router.use("/follows", followRoutes);
router.use("/chats", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/search", searchRoutes);

module.exports = router;
