const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chats");
const auth = require("../middleware/auth");

router.get("/", auth, chatController.getConversations);
router.get("/:userId", auth, chatController.getOrCreateConversation);
router.get("/:conversationId/messages", auth, chatController.getMessages);
router.post("/messages", auth, chatController.sendMessage);

module.exports = router;
