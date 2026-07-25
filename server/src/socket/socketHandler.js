const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const DirectMessage = require('../models/DirectMessage');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    // origin: true => phản chiếu origin của request, cho phép mọi máy trong LAN kết nối socket khi test.
    // Khi deploy thật, nên đổi lại thành danh sách domain cụ thể cho an toàn.
    cors: { origin: true, credentials: true },
  });

  // Xác thực JWT trước khi kết nối socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    io.emit('user_online', { userId: socket.user._id });

    // Phòng riêng theo user -- dùng để bắn thông báo (lời mời kết bạn, v.v.)
    // tới đúng người dùng đó dù họ đang mở trang nào, không cần biết trước channelId/conversationId.
    socket.join(`user:${socket.user._id}`);

    // Vào channel
    socket.on('join_channel', ({ channelId }) => {
      socket.join(channelId);
    });

    // Rời channel
    socket.on('leave_channel', ({ channelId }) => {
      socket.leave(channelId);
    });

    // Gửi tin nhắn real-time
    socket.on('send_message', async ({ channelId, content, replyTo }) => {
      try {
        if (!content?.trim()) return;
        const message = await Message.create({
          content: content.trim(),
          author: socket.user._id,
          channel: channelId,
          replyTo: replyTo || null,
        });
        await message.populate('author', 'username avatar');
        io.to(channelId).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ channelId }) => {
      socket.to(channelId).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    socket.on('stop_typing', ({ channelId }) => {
      socket.to(channelId).emit('user_stop_typing', { userId: socket.user._id });
    });

    // Vào phòng của 1 cuộc trò chuyện DM -- kiểm tra là participant trước khi
    // cho join, vì đây là tin nhắn riêng tư (khác với join_channel ở trên).
    socket.on('join_dm', async ({ conversationId }) => {
      const convo = await Conversation.findById(conversationId);
      if (convo && convo.participants.some((p) => p.equals(socket.user._id))) {
        socket.join(`dm:${conversationId}`);
      }
    });

    socket.on('leave_dm', ({ conversationId }) => {
      socket.leave(`dm:${conversationId}`);
    });

    // Gửi tin nhắn DM real-time
    socket.on('send_dm', async ({ conversationId, content }) => {
      try {
        if (!content?.trim()) return;
        const convo = await Conversation.findById(conversationId);
        if (!convo || !convo.participants.some((p) => p.equals(socket.user._id))) return;

        const message = await DirectMessage.create({
          content: content.trim(),
          sender: socket.user._id,
          conversation: conversationId,
        });
        await message.populate('sender', 'username avatar');

        convo.lastMessageAt = message.createdAt;
        await convo.save();

        io.to(`dm:${conversationId}`).emit('new_dm', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send direct message' });
      }
    });

    // Typing indicator cho DM
    socket.on('dm_typing', ({ conversationId }) => {
      socket.to(`dm:${conversationId}`).emit('dm_user_typing', {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    socket.on('dm_stop_typing', ({ conversationId }) => {
      socket.to(`dm:${conversationId}`).emit('dm_user_stop_typing', { userId: socket.user._id });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      io.emit('user_offline', { userId: socket.user._id });
    });
  });

  return io;
};

module.exports = initSocket;