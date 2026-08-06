const Channel = require('../models/Channel');
const ServerModel = require('../models/Server');
const { getRole } = require('../utils/permissions');
const { resolveChannelPermission } = require('../utils/channelPermissions');

// GET /api/servers/:serverId/channels
// Chỉ trả về những kênh mà actor thực sự có quyền xem (channel bị giới hạn "không cho xem"
// với role của actor sẽ không xuất hiện trong danh sách, giống kênh riêng tư trên Discord).
const getChannels = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const actorRole = getRole(server, req.user._id);
    if (!actorRole) return res.status(403).json({ success: false, message: 'Not a member' });

    const channels = await Channel.find({ server: req.params.serverId });
    const visibleChannels = channels.filter(
      (ch) => resolveChannelPermission(ch, actorRole).canView
    );
    res.json({ success: true, data: visibleChannels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers/:serverId/channels
const createChannel = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const member = server.members.find(m => m.user.equals(req.user._id));
    if (!member || getRole(server, req.user._id) !== 'owner')
      return res.status(403).json({ success: false, message: 'Only owner can create channels' });

    const name = req.body.name?.toLowerCase().replace(/\s+/g, '-');
    if (!name) return res.status(400).json({ success: false, message: 'Channel name is required' });

    const channel = await Channel.create({ name, server: server._id });
    res.status(201).json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/servers/:serverId/channels/:id  { name }
const updateChannel = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const member = server.members.find(m => m.user.equals(req.user._id));
    if (!member || getRole(server, req.user._id) !== 'owner')
      return res.status(403).json({ success: false, message: 'Only owner can rename channels' });

    const name = req.body.name?.toLowerCase().replace(/\s+/g, '-');
    if (!name) return res.status(400).json({ success: false, message: 'Channel name is required' });

    const channel = await Channel.findOneAndUpdate(
      { _id: req.params.id, server: req.params.serverId },
      { name },
      { new: true }
    );
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found in this server' });

    res.json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/servers/:serverId/channels/:id
const deleteChannel = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    const member = server?.members.find(m => m.user.equals(req.user._id));
    if (!member || getRole(server, req.user._id) !== 'owner')
      return res.status(403).json({ success: false, message: 'Only owner can delete channels' });

    const deleted = await Channel.findOneAndDelete({ _id: req.params.id, server: req.params.serverId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Channel not found in this server' });

    res.json({ success: true, message: 'Channel deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/servers/:serverId/channels/:id/permissions  { overrides: [{ role, canView, canSend }] }
// Chỉ owner được cấu hình quyền xem/nhắn tin theo role cho từng kênh.
// `overrides` thay thế toàn bộ danh sách cũ (không phải merge từng phần) để đơn giản hoá
// việc lưu — client luôn gửi lên đủ state hiện tại của form.
const updateChannelPermissions = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    if (getRole(server, req.user._id) !== 'owner')
      return res.status(403).json({ success: false, message: 'Chỉ chủ server mới được cấu hình quyền kênh' });

    const { overrides } = req.body;
    if (!Array.isArray(overrides))
      return res.status(400).json({ success: false, message: 'overrides phải là một mảng' });

    const seenRoles = new Set();
    const cleaned = [];
    for (const o of overrides) {
      if (!['moderator', 'member'].includes(o?.role))
        return res.status(400).json({ success: false, message: `Role không hợp lệ: ${o?.role}` });
      if (seenRoles.has(o.role))
        return res.status(400).json({ success: false, message: `Role bị lặp lại: ${o.role}` });
      seenRoles.add(o.role);

      const canView = Boolean(o.canView);
      // Không cho phép bật "nhắn tin" mà lại tắt "xem" — tự động ép canSend về false nếu vậy,
      // thay vì trả lỗi, để client không cần validate riêng trước khi gửi.
      const canSend = canView && Boolean(o.canSend);
      cleaned.push({ role: o.role, canView, canSend });
    }

    const channel = await Channel.findOneAndUpdate(
      { _id: req.params.id, server: req.params.serverId },
      { permissionOverrides: cleaned },
      { new: true }
    );
    if (!channel) return res.status(404).json({ success: false, message: 'Channel not found in this server' });

    res.json({ success: true, data: channel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getChannels, createChannel, updateChannel, deleteChannel, updateChannelPermissions };
