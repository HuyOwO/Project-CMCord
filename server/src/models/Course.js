const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Course (Milestone 2 – Learning System).
// Mỗi course gắn với 1 Server (lớp/nhóm) — server có thể có nhiều course
// (vd mỗi môn học một course riêng trong cùng 1 server lớp).
//
// Vai trò trong course TÁCH BIỆT với vai trò server (owner/moderator/member):
// 1 người có thể chỉ là 'member' thường của server nhưng là 'instructor' của course.
const courseSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  server:      { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  // Milestone 4 (Phân loại khoá học): 'general' (đại cương) giữ nguyên luồng
  // Bài học + Bài tập + Nộp bài + Chấm điểm hiện có. 'major' (chuyên ngành) thay
  // "Bài tập" bằng hệ thống Nhiệm vụ kiểu issue-tracker (xem models/Task.js) --
  // phân công cho thành viên + theo dõi tiến trình qua 3 trạng thái màu.
  // Cố định ngay từ lúc tạo, KHÔNG đổi được sau đó (đổi giữa chừng sẽ để lại dữ liệu
  // bài tập/nhiệm vụ mồ côi không khớp với luồng còn lại).
  type:        { type: String, enum: ['general', 'major'], default: 'general' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['instructor', 'ta', 'student'], default: 'student' },
  }],
  // Mã mời riêng của course, dùng để enroll (độc lập với inviteCode của Server).
  inviteCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8) },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
