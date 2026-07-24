const mongoose = require('mongoose');

// Cuộc trò chuyện riêng (Direct Message) giữa đúng 2 người dùng.
// MVP chỉ hỗ trợ DM 1-1 (chưa có group DM).
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  // Thời điểm tin nhắn gần nhất được gửi -> dùng để sắp xếp danh sách hội thoại.
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
