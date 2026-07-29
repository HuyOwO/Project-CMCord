const mongoose = require('mongoose');

// Bài nộp của 1 sinh viên cho 1 Assignment cụ thể.
// Nộp lại (resubmit) trước deadline chỉ cập nhật lại document này, không tạo bản ghi mới,
// để instructor/TA luôn thấy đúng 1 bài nộp mới nhất trên mỗi sinh viên.
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:    { type: String, default: '' },
  fileUrl:    { type: String, default: null },
  fileType:   { type: String, default: null },
  fileName:   { type: String, default: null },
  submittedAt: { type: Date, default: Date.now },
  isLate:     { type: Boolean, default: false },
  grade: {
    score:    { type: Number, default: null, min: 0, max: 10 },
    feedback: { type: String, default: '' },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    gradedAt: { type: Date, default: null },
  },
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
