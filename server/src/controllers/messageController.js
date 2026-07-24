const Message = require('../models/Message');
const { getUploadedFileUrl } = require('../utils/fileUrl');
const Channel = require('../models/Channel');
const ServerModel = require('../models/Server');
const { getRole, canDeleteMessage } = require('../utils/permissions');
// GET /api/channels/:channelId/messages?page=1&limit=50
const getMessages = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });

    const server = await ServerModel.findById(channel.server);
    const isMember = server?.members.some(m => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ channel: req.params.channelId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/channels/:channelId/messages
const sendMessage = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found' });

    const server = await ServerModel.findById(channel.server);
    const isMember = server?.members.some(m => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const { content, replyTo } = req.body;
    const fileUrl  = getUploadedFileUrl(req.file);
    const fileType = req.file ? req.file.mimetype : null;
    const fileName = req.file ? req.file.originalname : null;

    if (!content && !fileUrl)
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const message = await Message.create({
      content: content || '',
      author: req.user._id,
      channel: req.params.channelId,
      fileUrl, fileType, fileName,
      replyTo: replyTo || null,
    });

    await message.populate('author', 'username avatar');
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/messages/:id  { content }  -- chỉ tác giả được sửa tin nhắn của chính mình
const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    if (!message.author.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Chỉ được sửa tin nhắn của chính mình' });

    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });

    message.content = content;
    message.isEdited = true;
    await message.save();
    await message.populate('author', 'username avatar');

    req.app.get('io')?.to(message.channel.toString()).emit('message_edited', message);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    const isOwnMessage = message.author.equals(req.user._id);
    if (!isOwnMessage) {
      const channel = await Channel.findById(message.channel);
      const server = channel ? await ServerModel.findById(channel.server) : null;
      const actorRole = server ? getRole(server, req.user._id) : null;
      const authorRole = server ? getRole(server, message.author) : null;

      if (!actorRole || !canDeleteMessage(actorRole, authorRole))
        return res.status(403).json({ success: false, message: 'Không có quyền xoá tin nhắn này' });
    }

    await message.deleteOne();
    req.app.get('io')?.to(message.channel.toString()).emit('message_deleted', {
      messageId: message._id,
      channelId: message.channel,
    });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// PATCH /api/messages/:id/pin
const togglePin = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    message.isPinned = !message.isPinned;
    await message.save();
    await message.populate('author', 'username avatar');
    req.app.get('io')?.to(message.channel.toString()).emit('message_pinned', message);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/messages/:id/react  { emoji }
const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    let group = message.reactions.find(r => r.emoji === emoji);
    if (!group) {
      group = { emoji, users: [req.user._id] };
      message.reactions.push(group);
    } else if (group.users.some(u => u.equals(req.user._id))) {
      group.users = group.users.filter(u => !u.equals(req.user._id));
    } else {
      group.users.push(req.user._id);
    }
    message.reactions = message.reactions.filter(r => r.users.length > 0);

    await message.save();
    await message.populate('author', 'username avatar');
    req.app.get('io')?.to(message.channel.toString()).emit('message_reacted', message);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMessages, sendMessage, updateMessage, deleteMessage, togglePin, toggleReaction };