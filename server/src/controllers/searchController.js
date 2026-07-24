const ServerModel = require('../models/Server');
const Channel = require('../models/Channel');
const Message = require('../models/Message');

const MAX_RESULTS = 30;

// Escape ký tự đặc biệt của regex để query của user không phá vỡ pattern
// (và không dùng được để gây ReDoS).
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/servers/:id/search?q=...&scope=all|messages|files|members
const searchServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id).populate('members.user', 'username avatar');
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const isMember = server.members.some(m => (m.user?._id || m.user).equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const q = (req.query.q || '').trim();
    const scope = ['all', 'messages', 'files', 'members'].includes(req.query.scope)
      ? req.query.scope
      : 'all';

    if (!q) return res.status(400).json({ success: false, message: 'Thiếu từ khoá tìm kiếm' });

    const regex = new RegExp(escapeRegex(q), 'i');
    const result = { messages: [], files: [], members: [] };

    // Chỉ tìm trong các channel thuộc server này
    const channels = await Channel.find({ server: server._id }).select('_id name');
    const channelIds = channels.map(c => c._id);
    const channelNameById = Object.fromEntries(channels.map(c => [c._id.toString(), c.name]));

    if (scope === 'all' || scope === 'messages') {
      const messages = await Message.find({
        channel: { $in: channelIds },
        content: regex,
      })
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(MAX_RESULTS);

      result.messages = messages.map(m => ({
        ...m.toObject(),
        channelName: channelNameById[m.channel.toString()],
      }));
    }

    if (scope === 'all' || scope === 'files') {
      const files = await Message.find({
        channel: { $in: channelIds },
        fileUrl: { $ne: null },
        $or: [{ fileName: regex }, { content: regex }],
      })
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(MAX_RESULTS);

      result.files = files.map(m => ({
        ...m.toObject(),
        channelName: channelNameById[m.channel.toString()],
      }));
    }

    if (scope === 'all' || scope === 'members') {
      result.members = server.members
        .filter(m => regex.test(m.user?.username || '') || regex.test(m.nickname || ''))
        .map(m => ({
          user: m.user,
          role: server.owner.equals(m.user?._id) ? 'owner' : m.role,
          nickname: m.nickname,
        }))
        .slice(0, MAX_RESULTS);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { searchServer };
