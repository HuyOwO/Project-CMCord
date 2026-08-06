const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name:   { type: String, required: true, trim: true, lowercase: true },
  server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  type:   { type: String, enum: ['text'], default: 'text' },
  // Giới hạn quyền xem/nhắn tin theo role SERVER (moderator/member) riêng cho kênh này.
  // Role nào KHÔNG có trong mảng này -> mặc định vẫn xem + nhắn được (tương thích ngược
  // với các kênh chưa từng cấu hình). Owner luôn có toàn quyền, không bao giờ bị mảng này
  // giới hạn (xem utils/channelPermissions.js).
  permissionOverrides: [{
    role:    { type: String, enum: ['moderator', 'member'], required: true },
    canView: { type: Boolean, default: true },
    canSend: { type: Boolean, default: true },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
