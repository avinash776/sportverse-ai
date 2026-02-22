// ==================================================
// SportVerse AI - Direct Message Routes
// ==================================================

const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const DirectMessage = require('../models/DirectMessage');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get or create a conversation with another user
router.post('/conversation', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (userId === req.user._id.toString()) return res.status(400).json({ error: 'Cannot message yourself' });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 }
    }).populate('participants', 'name avatar role sport');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar role sport');
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar role sport')
      .sort({ last_message_at: -1, created_at: -1 })
      .lean();

    // Get unread counts for each conversation
    const result = await Promise.all(conversations.map(async (conv) => {
      const unread = await DirectMessage.countDocuments({
        conversation_id: conv._id,
        sender_id: { $ne: req.user._id },
        read: false,
      });

      const otherUser = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );

      return {
        ...conv,
        id: conv._id,
        other_user: otherUser,
        unread_count: unread,
      };
    }));

    res.json({ conversations: result });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages in a conversation
router.get('/conversation/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify user is participant
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await DirectMessage.find({ conversation_id: req.params.conversationId })
      .populate('sender_id', 'name avatar')
      .populate('shared_post_id', 'title content type sport')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Mark as read
    await DirectMessage.updateMany(
      { conversation_id: req.params.conversationId, sender_id: { $ne: req.user._id }, read: false },
      { read: true }
    );

    const result = messages.reverse().map(m => ({
      ...m,
      id: m._id,
      sender_name: m.sender_id?.name,
      sender_avatar: m.sender_id?.avatar,
    }));

    res.json({ messages: result });
  } catch (error) {
    console.error('Fetch DM messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a direct message
router.post('/conversation/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { content, type = 'text', shared_post_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await DirectMessage.create({
      conversation_id: req.params.conversationId,
      sender_id: req.user._id,
      content,
      type,
      shared_post_id: shared_post_id || null,
    });

    // Update conversation with last message
    conversation.last_message = content;
    conversation.last_message_at = new Date();
    conversation.last_sender_id = req.user._id;
    await conversation.save();

    const populated = await DirectMessage.findById(message._id)
      .populate('sender_id', 'name avatar')
      .lean();

    res.status(201).json({
      message: {
        ...populated,
        id: populated._id,
        sender_name: populated.sender_id?.name,
        sender_avatar: populated.sender_id?.avatar,
      }
    });
  } catch (error) {
    console.error('Send DM error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get total unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id });
    const convIds = conversations.map(c => c._id);

    const count = await DirectMessage.countDocuments({
      conversation_id: { $in: convIds },
      sender_id: { $ne: req.user._id },
      read: false,
    });

    res.json({ unread_count: count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
