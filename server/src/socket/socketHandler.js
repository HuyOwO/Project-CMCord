const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

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

    // Vào channel
    socket.on('join_channel', ({ channelId }) => {
      socket.join(channelId);
    });

    // Rời channel
    socket.on('leave_channel', ({ channelId }) => {
      socket.leave(channelId);
    });

    // Gửi tin nhắn real-time
    socket.on('send_message', async ({ channelId, content }) => {
      try {
        if (!content?.trim()) return;
        const message = await Message.create({
          content: content.trim(),
          author: socket.user._id,
          channel: channelId,
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

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

module.exports = initSocket;