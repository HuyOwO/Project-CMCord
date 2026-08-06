const mongoose = require('mongoose');

// Nhiệm vụ (Milestone 4) -- thay thế "Bài tập" cho course kiểu 'major' (chuyên ngành).
// Khác với Assignment (giao đề cho CẢ LỚP, mỗi sinh viên tự nộp bài riêng), Task
// giống issue trên GitHub: 1 nhiệm vụ được PHÂN CÔNG cho 1 người cụ thể (assignee)
// và cả course cùng theo dõi tiến trình qua field `status`.
//
// Quy ước trạng thái <-> màu hiển thị ở FE (xem client/src/utils/coursePermissions.js):
//   'unassigned'  (đỏ)  -- chưa phân công cho ai, assignee luôn null ở trạng thái này
//   'in_progress' (vàng) -- đã phân công, đang thực hiện
//   'done'        (xanh) -- đã hoàn thành
//
// Ràng buộc BẮT BUỘC giữ nhất quán (enforce ở taskController.js, không phải ở đây):
// assignee == null  <=>  status === 'unassigned'. Không thể vừa có assignee vừa ở
// trạng thái 'unassigned', và không thể chuyển sang 'in_progress'/'done' khi chưa có assignee.
const taskSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:      { type: String, enum: ['unassigned', 'in_progress', 'done'], default: 'unassigned' },
  deadline:    { type: Date, default: null },
  fileUrl:     { type: String, default: null },
  fileType:    { type: String, default: null },
  fileName:    { type: String, default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

taskSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
