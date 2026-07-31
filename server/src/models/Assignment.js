const mongoose = require('mongoose');

// Bài tập được giao trong 1 Course, có deadline và file đính kèm tuỳ chọn.
const assignmentSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  deadline:    { type: Date, default: null },
  fileUrl:     { type: String, default: null },
  fileType:    { type: String, default: null },
  fileName:    { type: String, default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Milestone 2: đánh dấu đã gửi nhắc deadline tự động cho assignment này chưa,
  // tránh deadlineReminderJob.js gửi trùng thông báo mỗi lần chạy định kỳ.
  remindersSent: { type: Boolean, default: false },
}, { timestamps: true });

assignmentSchema.index({ course: 1, deadline: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
