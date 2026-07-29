const Channel = require('../models/Channel');
const ServerModel = require('../models/Server');
const { getRole } = require('../utils/permissions');

// GET /api/servers/:serverId/channels
const getChannels = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const isMember = server.members.some(m => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const channels = await Channel.find({ server: req.params.serverId });
    res.json({ success: true, data: channels });
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

module.exports = { getChannels, createChannel, updateChannel, deleteChannel };
