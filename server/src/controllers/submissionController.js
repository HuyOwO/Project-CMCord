const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { getUploadedFileUrl } = require('../utils/fileUrl');
const { getCourseRole, canManageCourse } = require('../utils/coursePermissions');

// GET /api/assignments/:id/submissions
// instructor/TA -> tất cả bài nộp của assignment này; student -> chỉ bài nộp của chính mình
const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!role) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const filter = { assignment: assignment._id };
    if (!canManageCourse(role)) filter.student = req.user._id;

    const submissions = await Submission.find(filter)
      .populate('student', 'username avatar')
      .populate('grade.gradedBy', 'username avatar')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assignments/:id/submissions  { content } + file tuỳ chọn -- student nộp hoặc nộp lại bài
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!role) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const { content } = req.body;
    const fileUrl  = getUploadedFileUrl(req.file);
    const fileType = req.file ? req.file.mimetype : null;
    const fileName = req.file ? req.file.originalname : null;

    if (!content && !fileUrl)
      return res.status(400).json({ success: false, message: 'Bài nộp cần có nội dung hoặc file đính kèm' });

    const isLate = Boolean(assignment.deadline && new Date() > assignment.deadline);

    // Nộp lại trước/sau deadline chỉ cập nhật lại đúng 1 bản ghi cho mỗi sinh viên
    // (giữ nguyên điểm cũ nếu có, để instructor thấy rõ đây là lần nộp lại sau khi đã chấm).
    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: req.user._id },
      {
        $set: {
          content: content || '',
          fileUrl, fileType, fileName,
          submittedAt: new Date(),
          isLate,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('student', 'username avatar');

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/submissions/:id/grade  { score, feedback } -- instructor/TA chấm điểm + gửi thông báo real-time
const gradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const assignment = await Assignment.findById(submission.assignment);
    const course = assignment ? await Course.findById(assignment.course) : null;
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được chấm điểm' });

    const score = Number(req.body.score);
    if (Number.isNaN(score) || score < 0 || score > 10)
      return res.status(400).json({ success: false, message: 'Điểm phải nằm trong khoảng 0 - 10' });

    submission.grade = {
      score,
      feedback: req.body.feedback || '',
      gradedBy: req.user._id,
      gradedAt: new Date(),
    };
    await submission.save();
    await submission.populate('student', 'username avatar');
    await submission.populate('grade.gradedBy', 'username avatar');

    // Thông báo real-time tới đúng sinh viên đó qua phòng riêng `user:<id>`
    // (cùng cơ chế với thông báo lời mời kết bạn trong friendController.js).
    req.app.get('io')?.to(`user:${submission.student._id}`).emit('grade_posted', {
      submissionId: submission._id,
      assignmentId: assignment._id,
      assignmentTitle: assignment.title,
      courseId: assignment.course,
      courseName: course?.name,
      score: submission.grade.score,
      feedback: submission.grade.feedback,
    });

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSubmissions, submitAssignment, gradeSubmission };
