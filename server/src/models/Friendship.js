const mongoose = require('mongoose');

// 1 document đại diện cho 1 mối quan hệ giữa 2 user, theo hướng requester -> recipient.
// status='pending'  : requester đã gửi lời mời, chờ recipient phản hồi.
// status='accepted' : đã là bạn bè (2 chiều).
// Từ chối / huỷ lời mời / huỷ kết bạn đều đơn giản là XOÁ document này
// (không cần trạng thái 'declined' vì không cần giữ lịch sử).
const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
}, { timestamps: true });

friendshipSchema.index({ requester: 1, recipient: 1 });

module.exports = mongoose.model('Friendship', friendshipSchema);
