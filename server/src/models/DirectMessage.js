const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  content:      { type: String, default: '' },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  fileUrl:      { type: String, default: null },
  fileType:     { type: String, default: null },
  fileName:     { type: String, default: null },
  isEdited:     { type: Boolean, default: false },
  reactions: [{
    emoji: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
}, { timestamps: true });

module.exports = mongoose.model('DirectMessage', directMessageSchema);
