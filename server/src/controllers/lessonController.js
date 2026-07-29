const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { getUploadedFileUrl } = require('../utils/fileUrl');
const { getCourseRole, canManageCourse } = require('../utils/coursePermissions');

// GET /api/courses/:courseId/lessons -- mọi thành viên course đều xem được, theo thứ tự order
const getLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isMember = course.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses/:courseId/lessons  { title, content } + file tuỳ chọn -- instructor/TA
const createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const role = getCourseRole(course, req.user._id);
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được thêm bài học' });

    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ success: false, message: 'Tiêu đề bài học là bắt buộc' });

    const fileUrl  = getUploadedFileUrl(req.file);
    const fileType = req.file ? req.file.mimetype : null;
    const fileName = req.file ? req.file.originalname : null;

    // Bài học mới luôn xếp ở cuối danh sách hiện có
    const lastLesson = await Lesson.findOne({ course: course._id }).sort({ order: -1 });
    const order = lastLesson ? lastLesson.order + 1 : 0;

    const lesson = await Lesson.create({
      course: course._id,
      title,
      content: req.body.content || '',
      order,
      fileUrl, fileType, fileName,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/lessons/:id  { title, content } -- instructor/TA
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được sửa bài học' });

    const { title, content } = req.body;
    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
      lesson.title = title.trim();
    }
    if (content !== undefined) lesson.content = content;

    await lesson.save();
    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/lessons/:id/reorder  { order } -- instructor/TA, dùng khi kéo-thả sắp xếp lại thứ tự
const reorderLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được sắp xếp bài học' });

    const order = Number(req.body.order);
    if (Number.isNaN(order)) return res.status(400).json({ success: false, message: 'Thứ tự không hợp lệ' });

    lesson.order = order;
    await lesson.save();
    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/lessons/:id -- instructor/TA
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được xoá bài học' });

    await lesson.deleteOne();
    res.json({ success: true, message: 'Đã xoá bài học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLessons, createLesson, updateLesson, reorderLesson, deleteLesson };
