// ==================================================
// SportVerse AI - Chat Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Group = require('../models/Group');
const { authenticateToken } = require('../middleware/auth');

// Get messages for a room
router.get('/messages/:roomId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ room_id: req.params.roomId })
      .populate('user_id', 'name avatar')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const result = messages.reverse().map(m => ({
      ...m,
      id: m._id,
      user_name: m.user_id?.name,
      user_avatar: m.user_id?.avatar,
    }));

    res.json({ messages: result });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get user's chat rooms (groups they belong to)
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    // Find groups where user is a member
    const groups = await Group.find({ 'members.user_id': req.user._id })
      .select('name sport description members')
      .lean();

    // For each group, get the last message and member count
    const rooms = await Promise.all(groups.map(async (g) => {
      const lastMsg = await Message.findOne({ room_id: g._id.toString() })
        .sort({ created_at: -1 })
        .lean();

      return {
        id: g._id,
        name: g.name,
        sport: g.sport,
        description: g.description,
        member_count: g.members ? g.members.length : 0,
        last_message: lastMsg?.content || null,
        last_message_at: lastMsg?.created_at || null,
      };
    }));

    // Sort by last message time
    rooms.sort((a, b) => {
      if (!a.last_message_at) return 1;
      if (!b.last_message_at) return -1;
      return new Date(b.last_message_at) - new Date(a.last_message_at);
    });

    res.json({ rooms });
  } catch (error) {
    console.error('Fetch rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

module.exports = router;
