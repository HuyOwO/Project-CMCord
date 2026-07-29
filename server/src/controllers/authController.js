const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res.status(400).json({ success: false, message: 'Email or username already taken' });

    const user = await User.create({ username, email, password });
    res.status(201).json({ success: true, data: { user, token: generateToken(user._id) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json({ success: true, data: { user, token: generateToken(user._id) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
// PATCH /api/auth/password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(oldPassword)))
      return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng' });

    user.password = newPassword; // pre('save') hook trong User.js sẽ tự hash
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { register, login, getMe, changePassword };
