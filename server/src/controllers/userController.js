const User = require('../models/User');

// PATCH /api/users/me  { username, avatar }
const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (username) user.username = username.trim();
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { updateProfile };
