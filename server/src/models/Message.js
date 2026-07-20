const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content:  { type: String, default: '' },
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel:  { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  fileUrl:  { type: String, default: null },
  fileType: { type: String, default: null },
  isEdited: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  replyTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
