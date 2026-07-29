const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const serverSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  avatar:      { type: String, default: null },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // 'owner' KHÔNG nằm trong enum này — chủ server luôn được xác định qua field `owner` phía trên.
    role: { type: String, enum: ['moderator', 'member'], default: 'member' },
    // Biệt danh riêng của user này TRONG server này (khác với username toàn cục).
    nickname: { type: String, default: null, trim: true, maxlength: 32 },
  }],
  bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8) },
}, { timestamps: true });

<<<<<<< HEAD
module.exports = mongoose.model('Server', serverSchema);
=======
module.exports = mongoose.model('Server', serverSchema);
>>>>>>> milestone2-import
