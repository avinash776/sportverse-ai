// ==================================================
// SportVerse AI - Socket.io Configuration (MongoDB)
// ==================================================

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');
const Conversation = require('../models/Conversation');

let io;
// Track online users: { socketId -> userId, userId -> Set<socketId> }
const onlineUsers = new Map();
const userSockets = new Map();

function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userName = decoded.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.userId})`);

    // Track online status
    onlineUsers.set(socket.id, socket.userId);
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, new Set());
    }
    userSockets.get(socket.userId).add(socket.id);

    // Broadcast online status
    io.emit('user_online', { userId: socket.userId, userName: socket.userName });

    // Send current online users list to the newly connected user
    const onlineList = [...new Set([...onlineUsers.values()])];
    socket.emit('online_users', onlineList);

    // Join personal room for DMs
    socket.join(`user_${socket.userId}`);

    // ---- Group Chat ----
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`👤 ${socket.userName} joined room: ${roomId}`);
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('send_message', async (data) => {
      const { roomId, content, type = 'text' } = data;

      try {
        const message = await Message.create({
          room_id: roomId,
          user_id: socket.userId,
          content,
          type,
        });

        io.to(roomId).emit('new_message', {
          id: message._id,
          room_id: roomId,
          user_id: socket.userId,
          user_name: socket.userName,
          content,
          type,
          created_at: message.created_at,
        });
      } catch (err) {
        console.error('Save message error:', err);
      }
    });

    // ---- Direct Messages ----
    socket.on('send_dm', async (data) => {
      const { conversationId, content, type = 'text', shared_post_id } = data;

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) return;

        const message = await DirectMessage.create({
          conversation_id: conversationId,
          sender_id: socket.userId,
          content,
          type,
          shared_post_id: shared_post_id || null,
        });

        // Update conversation
        conversation.last_message = content;
        conversation.last_message_at = new Date();
        conversation.last_sender_id = socket.userId;
        await conversation.save();

        const msgData = {
          id: message._id,
          conversation_id: conversationId,
          sender_id: socket.userId,
          sender_name: socket.userName,
          content,
          type,
          created_at: message.created_at,
          read: false,
        };

        // Send to all participants in the conversation
        conversation.participants.forEach(pId => {
          io.to(`user_${pId.toString()}`).emit('new_dm', msgData);
        });
      } catch (err) {
        console.error('Send DM error:', err);
      }
    });

    socket.on('mark_read', async (data) => {
      const { conversationId } = data;
      try {
        await DirectMessage.updateMany(
          { conversation_id: conversationId, sender_id: { $ne: socket.userId }, read: false },
          { read: true }
        );
      } catch (err) {
        console.error('Mark read error:', err);
      }
    });

    // ---- Typing indicators ----
    socket.on('typing', (data) => {
      if (data.conversationId) {
        // DM typing
        socket.to(`user_${data.toUserId}`).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName,
          conversationId: data.conversationId,
        });
      } else {
        // Group typing
        socket.to(data.roomId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: data.isTyping
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userName}`);
      onlineUsers.delete(socket.id);
      const sockets = userSockets.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
          io.emit('user_offline', { userId: socket.userId });
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

function getOnlineUsers() {
  return [...new Set([...onlineUsers.values()])];
}

module.exports = { initSocketIO, getIO, getOnlineUsers };
