const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notifications");
const auth = require("../middleware/auth");

router.get("/", auth, notificationController.getNotifications);
router.post("/mark-read", auth, notificationController.markAsRead);
router.get("/unread-count", auth, notificationController.getUnreadCount);

module.exports = router;
