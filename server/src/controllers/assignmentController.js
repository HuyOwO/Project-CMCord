const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const { getUploadedFileUrl } = require('../utils/fileUrl');
const { getCourseRole, canManageCourse } = require('../utils/coursePermissions');

// GET /api/courses/:courseId/assignments -- mọi thành viên course đều xem được
const getAssignments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isMember = course.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const assignments = await Assignment.find({ course: course._id }).sort({ deadline: 1, createdAt: -1 });
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses/:courseId/assignments  { title, description, deadline } + file tuỳ chọn -- instructor/TA
const createAssignment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const role = getCourseRole(course, req.user._id);
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được giao bài tập' });

    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ success: false, message: 'Tiêu đề bài tập là bắt buộc' });

    const fileUrl  = getUploadedFileUrl(req.file);
    const fileType = req.file ? req.file.mimetype : null;
    const fileName = req.file ? req.file.originalname : null;

    const assignment = await Assignment.create({
      course: course._id,
      title,
      description: req.body.description || '',
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      fileUrl, fileType, fileName,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/assignments/:id
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    const isMember = course?.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/assignments/:id  { title, description, deadline } -- instructor/TA
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được sửa bài tập' });

    const { title, description, deadline } = req.body;
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
      assignment.title = title.trim();
    }
    if (description !== undefined) assignment.description = description;
    if (deadline !== undefined) assignment.deadline = deadline ? new Date(deadline) : null;

    await assignment.save();
    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/assignments/:id -- instructor/TA, xoá kèm toàn bộ bài nộp liên quan
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const course = await Course.findById(assignment.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được xoá bài tập' });

    await Submission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();
    res.json({ success: true, message: 'Đã xoá bài tập' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAssignments, createAssignment, getAssignment, updateAssignment, deleteAssignment };
