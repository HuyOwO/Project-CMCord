const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const authRoutes    = require('./routes/authRoutes');
const serverRoutes  = require('./routes/serverRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes     = require('./routes/userRoutes');
const dmRoutes       = require('./routes/dmRoutes');
const friendRoutes   = require('./routes/friendRoutes');
const app = express();

// origin: true => phản chiếu origin của request, cho phép mọi máy trong LAN gọi API khi test.
// Khi deploy thật, nên đổi lại thành danh sách domain cụ thể cho an toàn.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/servers',  serverRoutes);
app.use('/api/servers',  channelRoutes);
app.use('/api/channels', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/friends', friendRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File vượt quá dung lượng cho phép (tối đa 8MB)'
      : err.message;
    return res.status(400).json({ success: false, message });
  }
  if (err?.message === 'File type not allowed') {
    return res.status(400).json({ success: false, message: 'Định dạng file không được hỗ trợ' });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;