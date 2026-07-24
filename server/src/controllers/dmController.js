const Conversation = require('../models/Conversation');
const DirectMessage = require('../models/DirectMessage');
const ServerModel = require('../models/Server');
const User = require('../models/User');
const { getUploadedFileUrl } = require('../utils/fileUrl');

// Kiểm tra 2 user có chung ít nhất 1 server không. Dự án CHƯA có hệ thống bạn bè
// nên tạm chặn DM theo điều kiện này để tránh nhắn tin làm phiền người lạ
// (giống cách Discord chỉ cho nhắn khi chung server hoặc đã kết bạn).
const shareServer = async (userIdA, userIdB) => {
  const count = await ServerModel.countDocuments({
    'members.user': { $all: [userIdA, userIdB] },
  });
  return count > 0;
};

// GET /api/dm/contacts -- những người có thể bắt đầu nhắn tin (chung ít nhất 1 server)
const getContacts = async (req, res) => {
  try {
    const servers = await ServerModel.find({ 'members.user': req.user._id })
      .populate('members.user', 'username avatar');

    const seen = new Map();
    servers.forEach((srv) => {
      srv.members.forEach((m) => {
        const u = m.user;
        if (u && !u._id.equals(req.user._id) && !seen.has(u._id.toString())) {
          seen.set(u._id.toString(), { _id: u._id, username: u.username, avatar: u.avatar });
        }
      });
    });

    res.json({ success: true, data: Array.from(seen.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dm -- danh sách hội thoại của tôi, kèm tin nhắn gần nhất để hiển thị preview
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username avatar')
      .sort({ lastMessageAt: -1 });

    const withLastMessage = await Promise.all(
      conversations.map(async (c) => {
        const lastMessage = await DirectMessage.findOne({ conversation: c._id }).sort({ createdAt: -1 });
        return { ...c.toObject(), lastMessage };
      })
    );

    res.json({ success: true, data: withLastMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/dm  { userId } -- lấy hội thoại đã có với userId, hoặc tạo mới nếu chưa có
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
    if (userId === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Không thể tự nhắn tin cho chính mình' });

    const targetUser = await User.findById(userId).select('username avatar');
    if (!targetUser) return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });

    const canDM = await shareServer(req.user._id, userId);
    if (!canDM)
      return res.status(403).json({ success: false, message: 'Bạn cần chung ít nhất 1 server với người này để nhắn tin' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate('participants', 'username avatar');

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
      await conversation.populate('participants', 'username avatar');
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dm/:conversationId/messages?page=&limit=
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conversation.participants.some((p) => p.equals(req.user._id)))
      return res.status(403).json({ success: false, message: 'Not a participant' });

    const { page = 1, limit = 50 } = req.query;
    const messages = await DirectMessage.find({ conversation: conversation._id })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/dm/:conversationId/messages
const sendMessage = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conversation.participants.some((p) => p.equals(req.user._id)))
      return res.status(403).json({ success: false, message: 'Not a participant' });

    const { content } = req.body;
    const fileUrl  = getUploadedFileUrl(req.file);
    const fileType = req.file ? req.file.mimetype : null;
    const fileName = req.file ? req.file.originalname : null;

    if (!content && !fileUrl)
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const message = await DirectMessage.create({
      content: content || '',
      sender: req.user._id,
      conversation: conversation._id,
      fileUrl, fileType, fileName,
    });
    await message.populate('sender', 'username avatar');

    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    req.app.get('io')?.to(`dm:${conversation._id}`).emit('new_dm', message);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/dm/messages/:id  { content } -- chỉ người gửi được sửa tin nhắn của chính mình
const updateMessage = async (req, res) => {
  try {
    const message = await DirectMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (!message.sender.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Chỉ được sửa tin nhắn của chính mình' });

    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });

    message.content = content;
    message.isEdited = true;
    await message.save();
    await message.populate('sender', 'username avatar');

    req.app.get('io')?.to(`dm:${message.conversation}`).emit('dm_edited', message);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/dm/messages/:id -- DM không có moderator, chỉ tự xoá tin nhắn của mình
const deleteMessage = async (req, res) => {
  try {
    const message = await DirectMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (!message.sender.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Chỉ được xoá tin nhắn của chính mình' });

    await message.deleteOne();
    req.app.get('io')?.to(`dm:${message.conversation}`).emit('dm_deleted', {
      messageId: message._id,
      conversationId: message.conversation,
    });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/dm/messages/:id/react  { emoji }
const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await DirectMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    let group = message.reactions.find((r) => r.emoji === emoji);
    if (!group) {
      group = { emoji, users: [req.user._id] };
      message.reactions.push(group);
    } else if (group.users.some((u) => u.equals(req.user._id))) {
      group.users = group.users.filter((u) => !u.equals(req.user._id));
    } else {
      group.users.push(req.user._id);
    }
    message.reactions = message.reactions.filter((r) => r.users.length > 0);

    await message.save();
    await message.populate('sender', 'username avatar');
    req.app.get('io')?.to(`dm:${message.conversation}`).emit('dm_reacted', message);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getContacts, getConversations, getOrCreateConversation,
  getMessages, sendMessage, updateMessage, deleteMessage, toggleReaction,
  shareServer,
};
