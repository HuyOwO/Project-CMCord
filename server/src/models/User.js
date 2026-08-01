const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  avatar:   { type: String, default: null },
  // Milestone 3 (UI cải tiến): trạng thái người dùng tự chọn (Có mặt/Đang chờ/Vắng mặt).
  // Khác với "online/offline" xác định qua kết nối Socket.io (xem socketHandler.js):
  // status là lựa chọn thủ công, chỉ có ý nghĩa hiển thị khi user đang thực sự kết nối.
  // Client tự kết hợp 2 nguồn dữ liệu này (xem client/src/utils/status.js).
  // Lưu ý: user cũ trong DB (tạo trước khi thêm field này) sẽ tự nhận giá trị mặc định
  // 'online' khi được đọc ra (Mongoose áp default cho path bị thiếu lúc hydrate document),
  // không cần chạy migration riêng.
  status: { type: String, enum: ['online', 'idle', 'away'], default: 'online' },
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// So sánh password khi đăng nhập
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Không trả password trong JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
