const express = require('express');
const {
  getMessages,
  getPinnedMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  togglePin,
  toggleReaction,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/:channelId/messages', protect, getMessages);
router.post('/:channelId/messages', protect, upload.single('file'), sendMessage);

// Đặt TRƯỚC route dùng :channelId khác nếu có thêm sau này để tránh nhầm 'pinned'
// thành 1 channelId -- ở đây không xung đột vì đường dẫn khác nhánh (/pinned riêng).
router.get('/:channelId/pinned', protect, getPinnedMessages);

router.patch('/messages/:id', protect, updateMessage);
router.delete('/messages/:id', protect, deleteMessage);
router.patch('/messages/:id/pin', protect, togglePin);
router.post('/messages/:id/react', protect, toggleReaction);

module.exports = router;
