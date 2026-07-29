const mongoose = require('mongoose');

// Tài liệu bài học trong 1 Course, hiển thị theo thứ tự (order) tăng dần.
const lessonSchema = new mongoose.Schema({
  course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:    { type: String, required: true, trim: true },
  content:  { type: String, default: '' },
  order:    { type: Number, default: 0 },
  fileUrl:  { type: String, default: null },
  fileType: { type: String, default: null },
  fileName: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
