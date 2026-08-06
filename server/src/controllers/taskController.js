const Task = require('../models/Task');
const Course = require('../models/Course');
const { getUploadedFileUrl } = require('../utils/fileUrl');
const { getCourseRole, canManageCourse } = require('../utils/coursePermissions');

const POPULATE_FIELDS = [
  { path: 'assignee', select: 'username avatar' },
  { path: 'createdBy', select: 'username avatar' },
];

// GET /api/courses/:courseId/tasks -- mọi thành viên course đều xem được (để theo dõi tiến trình)
const getTasks = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const isMember = course.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    const tasks = await Task.find({ course: course._id })
      .populate(POPULATE_FIELDS)
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses/:courseId/tasks  { title, description, deadline } + file tuỳ chọn -- instructor/TA
// Nhiệm vụ mới luôn bắt đầu ở trạng thái 'unassigned' (đỏ) -- phân công là 1 bước riêng (xem assignTask).
const createTask = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.type !== 'major')
      return res.status(400).json({ success: false, message: 'Chỉ khoá học chuyên ngành mới dùng hệ thống Nhiệm vụ' });

    const role = getCourseRole(course, req.user._id);
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được tạo nhiệm vụ' });

    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ success: false, message: 'Tiêu đề nhiệm vụ là bắt buộc' });

    const fileUrl  = getUploadedFileUrl(req.file);
    const fileType = req.file ? req.file.mimetype : null;
    const fileName = req.file ? req.file.originalname : null;

    const task = await Task.create({
      course: course._id,
      title,
      description: req.body.description || '',
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      fileUrl, fileType, fileName,
      createdBy: req.user._id,
    });
    await task.populate(POPULATE_FIELDS);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(POPULATE_FIELDS);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const course = await Course.findById(task.course);
    const isMember = course?.members.some((m) => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: 'Not enrolled in this course' });

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/tasks/:id  { title, description, deadline, assigneeId } -- instructor/TA
// `assigneeId` ở đây gộp luôn thao tác "phân công": truyền id -> gán + tự chuyển 'in_progress'
// (trừ khi đã 'done' thì giữ nguyên); truyền null -> bỏ phân công, LUÔN đưa về 'unassigned'
// (không thể vừa unassign vừa giữ trạng thái đang làm/đã xong).
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const course = await Course.findById(task.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được sửa nhiệm vụ' });

    const { title, description, deadline, assigneeId } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
      task.title = title.trim();
    }
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;

    if (assigneeId !== undefined) {
      if (assigneeId === null || assigneeId === '') {
        task.assignee = null;
        task.status = 'unassigned';
      } else {
        const isCourseMember = course.members.some((m) => m.user.equals(assigneeId));
        if (!isCourseMember)
          return res.status(400).json({ success: false, message: 'Người được phân công phải là thành viên khoá học' });
        task.assignee = assigneeId;
        if (task.status === 'unassigned') task.status = 'in_progress';
      }
    }

    await task.save();
    await task.populate(POPULATE_FIELDS);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/tasks/:id/status  { status: 'in_progress' | 'done' }
// instructor/TA: đổi trạng thái bất kỳ nhiệm vụ nào trong course.
// Người được phân công (assignee): chỉ tự đổi trạng thái nhiệm vụ CỦA CHÍNH MÌNH
// (vd tự nhận "đang làm" -> "đã xong", hoặc mở lại nếu cần làm tiếp).
// Không cho phép set 'unassigned' qua endpoint này -- bỏ phân công phải qua updateTask.
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['in_progress', 'done'].includes(status))
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const course = await Course.findById(task.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    const isAssignee = task.assignee && task.assignee.equals(req.user._id);
    if (!canManageCourse(role) && !isAssignee)
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA hoặc người được phân công mới đổi được trạng thái' });

    if (!task.assignee)
      return res.status(400).json({ success: false, message: 'Nhiệm vụ chưa được phân công cho ai' });

    task.status = status;
    await task.save();
    await task.populate(POPULATE_FIELDS);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tasks/:id -- instructor/TA
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const course = await Course.findById(task.course);
    const role = course ? getCourseRole(course, req.user._id) : null;
    if (!canManageCourse(role))
      return res.status(403).json({ success: false, message: 'Chỉ instructor/TA mới được xoá nhiệm vụ' });

    await task.deleteOne();
    res.json({ success: true, message: 'Đã xoá nhiệm vụ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, updateTaskStatus, deleteTask };
