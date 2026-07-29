const Course = require('../models/Course');
const ServerModel = require('../models/Server');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { getRole } = require('../utils/permissions');
const { getCourseRole, isCourseInstructor } = require('../utils/coursePermissions');

// GET /api/servers/:serverId/courses -- chỉ thành viên server mới xem được danh sách course
const getCourses = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const isMember = server.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a member' });

    const courses = await Course.find({ server: server._id }).populate('members.user', 'username avatar');
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/servers/:serverId/courses  { name, description }
// Chỉ owner/moderator của SERVER mới được tạo course mới cho lớp; người tạo tự động là instructor.
const createCourse = async (req, res) => {
  try {
    const server = await ServerModel.findById(req.params.serverId);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const serverRole = getRole(server, req.user._id);
    if (!serverRole || (serverRole !== 'owner' && serverRole !== 'moderator'))
      return res.status(403).json({ success: false, message: 'Chỉ owner hoặc moderator của server mới được tạo khoá học' });

    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ success: false, message: 'Tên khoá học là bắt buộc' });

    const course = await Course.create({
      name,
      description: req.body.description?.trim() || '',
      server: server._id,
      members: [{ user: req.user._id, role: 'instructor' }],
    });
    await course.populate('members.user', 'username avatar');

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/courses/:id
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('members.user', 'username avatar');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isMember = course.members.some((m) => (m.user?._id || m.user).equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses/join  { inviteCode } -- enroll với vai trò student
const joinCourse = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const course = await Course.findOne({ inviteCode });
    if (!course) return res.status(404).json({ success: false, message: 'Mã mời không hợp lệ' });

    const alreadyMember = course.members.some((m) => m.user.equals(req.user._id));
    if (alreadyMember) return res.status(400).json({ success: false, message: 'Bạn đã tham gia khoá học này' });

    course.members.push({ user: req.user._id, role: 'student' });
    await course.save();
    await course.populate('members.user', 'username avatar');
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/courses/:id  { name, description } -- chỉ instructor
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const role = getCourseRole(course, req.user._id);
    if (!isCourseInstructor(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor mới được sửa khoá học' });

    const { name, description } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ success: false, message: 'Tên khoá học không được để trống' });
      course.name = name.trim();
    }
    if (description !== undefined) course.description = description.trim();

    await course.save();
    await course.populate('members.user', 'username avatar');
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/courses/:id -- chỉ instructor, xoá kèm toàn bộ lesson/assignment/submission liên quan
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const role = getCourseRole(course, req.user._id);
    if (!isCourseInstructor(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor mới được xoá khoá học' });

    const assignments = await Assignment.find({ course: course._id }).select('_id');
    await Submission.deleteMany({ assignment: { $in: assignments.map((a) => a._id) } });
    await Assignment.deleteMany({ course: course._id });
    await Lesson.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ success: true, message: 'Đã xoá khoá học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/courses/:id/members/:userId/role  { role: 'ta' | 'student' }
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['ta', 'student'].includes(role))
      return res.status(400).json({ success: false, message: 'Role không hợp lệ' });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const actorRole = getCourseRole(course, req.user._id);
    if (!isCourseInstructor(actorRole))
      return res.status(403).json({ success: false, message: 'Chỉ instructor mới được đổi quyền' });

    const member = course.members.find((m) => m.user.equals(req.params.userId));
    if (!member) return res.status(404).json({ success: false, message: 'Thành viên không tồn tại' });

    if (member.role === 'instructor' && role !== 'instructor') {
      const instructorCount = course.members.filter((m) => m.role === 'instructor').length;
      if (instructorCount <= 1)
        return res.status(400).json({ success: false, message: 'Khoá học phải có ít nhất 1 instructor' });
    }

    member.role = role;
    await course.save();
    await course.populate('members.user', 'username avatar');
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/courses/:id/members/:userId -- chỉ instructor, không tự xoá chính mình nếu là instructor cuối cùng
const removeMember = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const actorRole = getCourseRole(course, req.user._id);
    if (!isCourseInstructor(actorRole))
      return res.status(403).json({ success: false, message: 'Chỉ instructor mới được xoá thành viên' });

    const target = course.members.find((m) => m.user.equals(req.params.userId));
    if (!target) return res.status(404).json({ success: false, message: 'Thành viên không tồn tại' });

    if (target.role === 'instructor') {
      const instructorCount = course.members.filter((m) => m.role === 'instructor').length;
      if (instructorCount <= 1)
        return res.status(400).json({ success: false, message: 'Khoá học phải có ít nhất 1 instructor' });
    }

    course.members = course.members.filter((m) => !m.user.equals(req.params.userId));
    await course.save();
    res.json({ success: true, message: 'Đã xoá thành viên khỏi khoá học' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCourses, createCourse, getCourse, joinCourse,
  updateCourse, deleteCourse, updateMemberRole, removeMember,
};
