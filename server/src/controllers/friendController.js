const Friendship = require('../models/Friendship');
const User = require('../models/User');

// Kiểm tra 2 user đã là bạn bè (status='accepted') chưa, không quan tâm chiều.
// Dùng ở dmController để cho phép nhắn tin trực tiếp giữa bạn bè dù không chung server.
const areFriends = async (userIdA, userIdB) => {
  const count = await Friendship.countDocuments({
    status: 'accepted',
    $or: [
      { requester: userIdA, recipient: userIdB },
      { requester: userIdB, recipient: userIdA },
    ],
  });
  return count > 0;
};

// GET /api/friends -- danh sách bạn bè + lời mời đến/đi, gộp trong 1 lần gọi
const getAll = async (req, res) => {
  try {
    const relations = await Friendship.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    }).populate('requester recipient', 'username avatar');

    const friends = [];
    const incomingRequests = [];
    const outgoingRequests = [];

    relations.forEach((r) => {
      const isRequester = r.requester._id.equals(req.user._id);
      const other = isRequester ? r.recipient : r.requester;

      if (r.status === 'accepted') {
        friends.push({ _id: r._id, user: other, since: r.updatedAt });
      } else if (isRequester) {
        outgoingRequests.push({ _id: r._id, user: other, createdAt: r.createdAt });
      } else {
        incomingRequests.push({ _id: r._id, user: other, createdAt: r.createdAt });
      }
    });

    res.json({ success: true, data: { friends, incomingRequests, outgoingRequests } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/friends/requests  { username } -- gửi lời mời kết bạn theo username
const sendRequest = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    if (!username) return res.status(400).json({ success: false, message: 'Thiếu username' });

    const target = await User.findOne({ username }).select('username avatar');
    if (!target) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng này' });
    if (target._id.equals(req.user._id))
      return res.status(400).json({ success: false, message: 'Không thể tự kết bạn với chính mình' });

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: target._id },
        { requester: target._id, recipient: req.user._id },
      ],
    });
    if (existing) {
      const message = existing.status === 'accepted'
        ? 'Hai người đã là bạn bè'
        : 'Đã có lời mời kết bạn đang chờ giữa 2 người';
      return res.status(409).json({ success: false, message });
    }

    const friendship = await Friendship.create({ requester: req.user._id, recipient: target._id });
    await friendship.populate('requester recipient', 'username avatar');

    req.app.get('io')?.to(`user:${target._id}`).emit('friend_request_received', {
      _id: friendship._id,
      user: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
      createdAt: friendship.createdAt,
    });

    res.status(201).json({ success: true, data: friendship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/friends/requests/:id/accept -- chỉ recipient được chấp nhận
const acceptRequest = async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.id).populate('requester recipient', 'username avatar');
    if (!friendship) return res.status(404).json({ success: false, message: 'Không tìm thấy lời mời' });
    if (!friendship.recipient._id.equals(req.user._id))
      return res.status(403).json({ success: false, message: 'Không có quyền chấp nhận lời mời này' });
    if (friendship.status === 'accepted')
      return res.status(400).json({ success: false, message: 'Lời mời đã được chấp nhận trước đó' });

    friendship.status = 'accepted';
    await friendship.save();

    req.app.get('io')?.to(`user:${friendship.requester._id}`).emit('friend_request_accepted', {
      _id: friendship._id,
      user: { _id: friendship.recipient._id, username: friendship.recipient.username, avatar: friendship.recipient.avatar },
      since: friendship.updatedAt,
    });

    res.json({
      success: true,
      data: { _id: friendship._id, user: friendship.requester, since: friendship.updatedAt },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/friends/:id -- dùng chung cho từ chối lời mời đến / huỷ lời mời đã gửi / huỷ kết bạn
const removeFriendship = async (req, res) => {
  try {
    const friendship = await Friendship.findById(req.params.id);
    if (!friendship) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

    const isRequester = friendship.requester.equals(req.user._id);
    const isRecipient = friendship.recipient.equals(req.user._id);
    if (!isRequester && !isRecipient)
      return res.status(403).json({ success: false, message: 'Không có quyền thực hiện hành động này' });

    const otherUserId = isRequester ? friendship.recipient : friendship.requester;
    await friendship.deleteOne();

    req.app.get('io')?.to(`user:${otherUserId}`).emit('friend_removed', { friendshipId: friendship._id });
    res.json({ success: true, message: 'Đã xoá' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, sendRequest, acceptRequest, removeFriendship, areFriends };
