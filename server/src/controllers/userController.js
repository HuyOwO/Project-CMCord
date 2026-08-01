const User = require('../models/User');
const { getUploadedFileUrl } = require('../utils/fileUrl');

const ALLOWED_STATUSES = ['online', 'idle', 'away'];

// PATCH /api/users/me  { username, status }
// Đổi tên hiển thị và/hoặc trạng thái -- KHÔNG yêu cầu nhập lại mật khẩu vì đây là
// thông tin ít nhạy cảm (giống Discord: đổi display name/status không cần xác thực lại).
const updateProfile = async (req, res) => {
  try {
    const { username, status, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });

    if (username !== undefined) {
      const trimmed = username.trim();
      if (!trimmed || trimmed.length < 3)
        return res.status(400).json({ success: false, message: 'Tên hiển thị phải có ít nhất 3 ký tự' });

      if (trimmed !== user.username) {
        const taken = await User.findOne({ username: trimmed, _id: { $ne: user._id } });
        if (taken) return res.status(400).json({ success: false, message: 'Username đã được sử dụng' });
      }
      user.username = trimmed;
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status))
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
      user.status = status;
    }

    // Giữ tương thích ngược: cho phép set avatar bằng URL trực tiếp (vd xoá avatar = null).
    // Khi upload file thật, dùng route POST /api/users/me/avatar bên dưới thay vì field này.
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    // Báo cho mọi client khác biết trạng thái vừa đổi (member list, friend list, DM list...
    // đều lắng nghe sự kiện này qua SocketContext.jsx để cập nhật chấm trạng thái real-time).
    req.app.get('io')?.emit('user_status_changed', { userId: user._id.toString(), status: user.status });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/users/me/email  { newEmail, password }
// Đổi email -- BẮT BUỘC xác nhận lại mật khẩu hiện tại vì email dùng để đăng nhập/khôi phục
// tài khoản, đổi được coi là hành động nhạy cảm.
const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email mới và mật khẩu hiện tại' });

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(password)))
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });

    const normalized = newEmail.trim().toLowerCase();
    if (!normalized.includes('@'))
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    if (normalized === user.email)
      return res.status(400).json({ success: false, message: 'Email mới trùng với email hiện tại' });

    const taken = await User.findOne({ email: normalized, _id: { $ne: user._id } });
    if (taken) return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi tài khoản khác' });

    user.email = normalized;
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/me/avatar  (multipart, field "avatar")
// Upload ảnh đại diện mới -- dùng chung uploadMiddleware.js với message/lesson/assignment
// attachments (Cloudinary khi có cấu hình, fallback lưu đĩa cục bộ khi dev).
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh đại diện' });

    const user = await User.findById(req.user._id);
    user.avatar = getUploadedFileUrl(req.file);
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { updateProfile, updateEmail, updateAvatar };
