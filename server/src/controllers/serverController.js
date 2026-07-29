const ServerModel = require('../models/Server');
const Channel = require('../models/Channel');
const { getRole, canModerateMember, canChangeRole } = require('../utils/permissions');

// GET /api/servers
const getServers = async (req, res) => {
  try {
    const servers = await ServerModel.find({ 'members.user': req.user._id }).populate('owner', 'username avatar');
    res.json({ success: true, data: servers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers
const createServer = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Server name is required' });

    const server = await ServerModel.create({
      name, description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'moderator' }],
    });

    // Tạo channel #general mặc định
    await Channel.create({ name: 'general', server: server._id });

    res.status(201).json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/servers/:id
const getServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members.user', 'username avatar');
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const isMember = server.members.some(m => m.user._id.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers/join  { inviteCode }
const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const server = await ServerModel.findOne({ inviteCode });
    if (!server) return res.status(404).json({ success: false, message: 'Invalid invite code' });

    if (server.bannedUsers.some(id => id.equals(req.user._id)))
      return res.status(403).json({ success: false, message: 'Bạn đã bị ban khỏi server này' });

    const alreadyMember = server.members.some(m => m.user.equals(req.user._id));
    if (alreadyMember) return res.status(400).json({ success: false, message: 'Already a member' });

    server.members.push({ user: req.user._id, role: 'member' });
    await server.save();
    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/servers/:id/members/:userId/role  { role: 'moderator' | 'member' }
// Chỉ owner được trao/thu hồi quyền moderator.
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['moderator', 'member'].includes(role))
      return res.status(400).json({ success: false, message: 'Role không hợp lệ' });

    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const actorRole = getRole(server, req.user._id);
    if (!canChangeRole(actorRole))
      return res.status(403).json({ success: false, message: 'Chỉ chủ server mới được đổi quyền' });

    const member = server.members.find(m => m.user.equals(req.params.userId));
    if (!member) return res.status(404).json({ success: false, message: 'Thành viên không tồn tại' });
    if (server.owner.equals(req.params.userId))
      return res.status(400).json({ success: false, message: 'Không thể đổi quyền của chủ server' });

    member.role = role;
    await server.save();
    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/servers/:id/members/:userId  -> kick khỏi server (vẫn có thể join lại bằng mã mời)
const kickMember = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const actorRole = getRole(server, req.user._id);
    const targetRole = getRole(server, req.params.userId);
    if (!targetRole) return res.status(404).json({ success: false, message: 'Thành viên không tồn tại' });
    if (!canModerateMember(actorRole, targetRole))
      return res.status(403).json({ success: false, message: 'Không có quyền kick thành viên này' });

    server.members = server.members.filter(m => !m.user.equals(req.params.userId));
    await server.save();
    res.json({ success: true, message: 'Đã kick thành viên' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers/:id/bans/:userId  -> kick + chặn không cho join lại bằng mã mời
const banMember = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const actorRole = getRole(server, req.user._id);
    const targetRole = getRole(server, req.params.userId);
    if (!targetRole) return res.status(404).json({ success: false, message: 'Thành viên không tồn tại' });
    if (!canModerateMember(actorRole, targetRole))
      return res.status(403).json({ success: false, message: 'Không có quyền ban thành viên này' });

    server.members = server.members.filter(m => !m.user.equals(req.params.userId));
    if (!server.bannedUsers.some(id => id.equals(req.params.userId))) {
      server.bannedUsers.push(req.params.userId);
    }
    await server.save();
    res.json({ success: true, message: 'Đã ban thành viên' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/servers/:id/bans/:userId -> gỡ ban, chỉ owner được làm
const unbanMember = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const actorRole = getRole(server, req.user._id);
    if (actorRole !== 'owner')
      return res.status(403).json({ success: false, message: 'Chỉ chủ server mới được gỡ ban' });

    server.bannedUsers = server.bannedUsers.filter(id => !id.equals(req.params.userId));
    await server.save();
    res.json({ success: true, message: 'Đã gỡ ban' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/servers/:id  { name, description } -- chỉ owner được sửa
const updateServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    if (!server.owner.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Chỉ chủ server mới được sửa cài đặt' });

    const { name, description } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Tên server không được để trống' });
      server.name = name.trim();
    }
    if (description !== undefined) server.description = description.trim();

    await server.save();
    await server.populate('owner', 'username avatar');
    await server.populate('members.user', 'username avatar');
    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/servers/:id/nickname  { nickname }  -- mỗi người tự đổi biệt danh của chính mình
const updateNickname = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const member = server.members.find(m => m.user.equals(req.user._id));
    if (!member) return res.status(403).json({ success: false, message: 'Not a member' });

    const nickname = req.body.nickname?.trim();
    member.nickname = nickname || null; // rỗng -> xoá biệt danh, dùng lại username gốc
    await server.save();
    await server.populate('owner', 'username avatar');
    await server.populate('members.user', 'username avatar');
    res.json({ success: true, data: server });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/servers/:id/leave  -- tự rời server, owner không được dùng API này (phải xoá server thay vào đó)
const leaveServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    if (server.owner.equals(req.user._id))
      return res.status(400).json({ success: false, message: 'Chủ server không thể rời server, hãy xoá server thay vào đó' });

    const wasMember = server.members.some(m => m.user.equals(req.user._id));
    if (!wasMember) return res.status(400).json({ success: false, message: 'Bạn không phải thành viên của server này' });

    server.members = server.members.filter(m => !m.user.equals(req.user._id));
    await server.save();
    res.json({ success: true, message: 'Đã rời server' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/servers/:id
const deleteServer = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    if (!server.owner.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Only owner can delete server' });

    await server.deleteOne();
    await Channel.deleteMany({ server: server._id });
    res.json({ success: true, message: 'Server deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getServers, createServer, getServer, joinServer, deleteServer,
  updateServer, updateNickname, leaveServer,
  updateMemberRole, kickMember, banMember, unbanMember,
};
