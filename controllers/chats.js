const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getIO } = require("../utils/socket");

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate("participants", "username name profilePicture")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId], $size: 2 },
    }).populate("participants", "username name profilePicture");

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user.id, userId],
      });

      await conversation.save();
      conversation = await conversation.populate(
        "participants",
        "username name profilePicture"
      );
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "username name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse()); // Return oldest first
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    // Check if user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(403).json({ error: "Not part of this conversation" });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user.id,
      content,
    });

    await message.save();

    // Update conversation timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: Date.now(),
    });

    // Find recipient (the other participant)
    const recipientId = conversation.participants.find(
      (id) => id.toString() !== req.user.id
    );

    // Create notification
    await Notification.create({
      recipient: recipientId,
      sender: req.user.id,
      type: "message",
      content: "You have a new message",
    });

    // Populate sender info for real-time emission
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username name profilePicture"
    );

    const io = getIO();
    if (io) {
      io.to(conversationId).emit("newMessage", populatedMessage);
      console.log("Hello emitted via socked ", conversationId);
    }
    else {
      console.warn("socket.io is not available for real time mesaging")
    }

    // Emit real-time event
    // req.io.to(conversationId).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
