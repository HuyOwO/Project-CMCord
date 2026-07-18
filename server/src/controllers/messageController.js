const Message = require('../models/Message');
const Channel = require('../models/Channel');
const ServerModel = require('../models/Server');
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

    const { content } = req.body;
    const fileUrl  = req.file ? `/uploads/${req.file.filename}` : null;
    const fileType = req.file ? req.file.mimetype : null;

    if (!content && !fileUrl)
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const message = await Message.create({
      content: content || '',
      author: req.user._id,
      channel: req.params.channelId,
      fileUrl, fileType,
    });

    await message.populate('author', 'username avatar');
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (!message.author.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Cannot delete others messages' });

    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMessages, sendMessage, deleteMessage };
