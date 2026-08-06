// Mock hẳn Model thay vì mongoose thật -- test này chỉ quan tâm LOGIC của controller
// (quyền hạn, ràng buộc assignee<->status), không cần kết nối MongoDB thật.
jest.mock('../../src/models/Task', () => ({ create: jest.fn(), findById: jest.fn() }));
jest.mock('../../src/models/Course', () => ({ findById: jest.fn() }));
jest.mock('../../src/utils/fileUrl', () => ({ getUploadedFileUrl: jest.fn(() => null) }));

const Task = require('../../src/models/Task');
const Course = require('../../src/models/Course');
const {
  createTask, updateTask, updateTaskStatus, deleteTask,
} = require('../../src/controllers/taskController');
const { mockResponse } = require('../testUtils');

// Giả lập ObjectId của Mongoose: có cả .toString() (dùng bởi getCourseRole) lẫn
// .equals() (dùng bởi các so sánh trực tiếp trong taskController).
const oid = (id) => ({
  toString: () => id,
  equals: (other) => id === (other?.toString ? other.toString() : other),
});

describe('taskController.createTask', () => {
  beforeEach(() => jest.clearAllMocks());

  test('404 nếu course không tồn tại', async () => {
    Course.findById.mockResolvedValue(null);
    const req = { params: { courseId: 'c1' }, body: { title: 'T' }, user: { _id: oid('u1') } };
    const res = mockResponse();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('400 nếu course không phải kiểu chuyên ngành (major)', async () => {
    Course.findById.mockResolvedValue({
      _id: oid('c1'), type: 'general',
      members: [{ user: oid('u1'), role: 'instructor' }],
    });
    const req = { params: { courseId: 'c1' }, body: { title: 'T' }, user: { _id: oid('u1') } };
    const res = mockResponse();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Task.create).not.toHaveBeenCalled();
  });

  test('403 nếu người tạo không phải instructor/TA', async () => {
    Course.findById.mockResolvedValue({
      _id: oid('c1'), type: 'major',
      members: [{ user: oid('u1'), role: 'student' }],
    });
    const req = { params: { courseId: 'c1' }, body: { title: 'T' }, user: { _id: oid('u1') } };
    const res = mockResponse();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('tạo thành công -> luôn bắt đầu ở trạng thái mặc định của schema (unassigned)', async () => {
    Course.findById.mockResolvedValue({
      _id: oid('c1'), type: 'major',
      members: [{ user: oid('ta1'), role: 'ta' }],
    });
    const created = { populate: jest.fn().mockResolvedValue(undefined) };
    Task.create.mockResolvedValue(created);

    const req = {
      params: { courseId: 'c1' },
      body: { title: 'Xây API đăng nhập', description: 'desc' },
      user: { _id: oid('ta1') },
      file: null,
    };
    const res = mockResponse();

    await createTask(req, res);

    expect(Task.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Xây API đăng nhập',
      course: expect.anything(),
      createdBy: expect.anything(),
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('taskController.updateTask (phân công / bỏ phân công)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('gán assigneeId mới cho nhiệm vụ đang unassigned -> tự chuyển sang in_progress', async () => {
    const course = {
      _id: oid('c1'), type: 'major',
      members: [
        { user: oid('instructor1'), role: 'instructor' },
        { user: oid('student1'), role: 'student' },
      ],
    };
    Course.findById.mockResolvedValue(course);
    const task = {
      course: oid('c1'), status: 'unassigned', assignee: null,
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Task.findById.mockResolvedValue(task);

    const req = { params: { id: 't1' }, body: { assigneeId: 'student1' }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await updateTask(req, res);

    expect(task.assignee).toBe('student1');
    expect(task.status).toBe('in_progress');
    expect(task.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('gán lại assignee cho nhiệm vụ đã "done" -> KHÔNG lùi trạng thái về in_progress', async () => {
    const course = {
      _id: oid('c1'), type: 'major',
      members: [
        { user: oid('instructor1'), role: 'instructor' },
        { user: oid('student1'), role: 'student' },
        { user: oid('student2'), role: 'student' },
      ],
    };
    Course.findById.mockResolvedValue(course);
    const task = {
      course: oid('c1'), status: 'done', assignee: oid('student1'),
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Task.findById.mockResolvedValue(task);

    const req = { params: { id: 't1' }, body: { assigneeId: 'student2' }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await updateTask(req, res);

    expect(task.assignee).toBe('student2');
    expect(task.status).toBe('done'); // giữ nguyên, không tự "mở lại"
  });

  test('assigneeId = null -> bỏ phân công, LUÔN đưa trạng thái về unassigned dù đang done', async () => {
    const course = {
      _id: oid('c1'), type: 'major',
      members: [{ user: oid('instructor1'), role: 'instructor' }, { user: oid('student1'), role: 'student' }],
    };
    Course.findById.mockResolvedValue(course);
    const task = {
      course: oid('c1'), status: 'done', assignee: oid('student1'),
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Task.findById.mockResolvedValue(task);

    const req = { params: { id: 't1' }, body: { assigneeId: null }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await updateTask(req, res);

    expect(task.assignee).toBe(null);
    expect(task.status).toBe('unassigned');
  });

  test('400 nếu người được phân công không phải thành viên course', async () => {
    const course = {
      _id: oid('c1'), type: 'major',
      members: [{ user: oid('instructor1'), role: 'instructor' }],
    };
    Course.findById.mockResolvedValue(course);
    const task = {
      course: oid('c1'), status: 'unassigned', assignee: null,
      save: jest.fn(), populate: jest.fn(),
    };
    Task.findById.mockResolvedValue(task);

    const req = { params: { id: 't1' }, body: { assigneeId: 'outsider' }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(task.save).not.toHaveBeenCalled();
  });

  test('403 nếu người sửa không phải instructor/TA', async () => {
    const course = {
      _id: oid('c1'), type: 'major',
      members: [{ user: oid('student1'), role: 'student' }],
    };
    Course.findById.mockResolvedValue(course);
    Task.findById.mockResolvedValue({ course: oid('c1') });

    const req = { params: { id: 't1' }, body: { title: 'x' }, user: { _id: oid('student1') } };
    const res = mockResponse();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('taskController.updateTaskStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 nếu status gửi lên không hợp lệ (vd cố set thẳng "unassigned")', async () => {
    const req = { params: { id: 't1' }, body: { status: 'unassigned' }, user: { _id: oid('u1') } };
    const res = mockResponse();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Task.findById).not.toHaveBeenCalled();
  });

  test('người được phân công (assignee) tự đổi trạng thái nhiệm vụ của chính mình -> OK', async () => {
    const task = {
      course: oid('c1'), assignee: oid('student1'), status: 'in_progress',
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Task.findById.mockResolvedValue(task);
    Course.findById.mockResolvedValue({ members: [{ user: oid('student1'), role: 'student' }] });

    const req = { params: { id: 't1' }, body: { status: 'done' }, user: { _id: oid('student1') } };
    const res = mockResponse();

    await updateTaskStatus(req, res);

    expect(task.status).toBe('done');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('403 nếu không phải instructor/TA và cũng không phải assignee của nhiệm vụ', async () => {
    const task = { course: oid('c1'), assignee: oid('student1'), status: 'in_progress' };
    Task.findById.mockResolvedValue(task);
    Course.findById.mockResolvedValue({
      members: [{ user: oid('student1'), role: 'student' }, { user: oid('bystander'), role: 'student' }],
    });

    const req = { params: { id: 't1' }, body: { status: 'done' }, user: { _id: oid('bystander') } };
    const res = mockResponse();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('instructor/TA vẫn đổi được trạng thái dù không phải assignee', async () => {
    const task = {
      course: oid('c1'), assignee: oid('student1'), status: 'in_progress',
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Task.findById.mockResolvedValue(task);
    Course.findById.mockResolvedValue({
      members: [{ user: oid('student1'), role: 'student' }, { user: oid('instructor1'), role: 'instructor' }],
    });

    const req = { params: { id: 't1' }, body: { status: 'done' }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await updateTaskStatus(req, res);

    expect(task.status).toBe('done');
  });

  test('400 nếu nhiệm vụ chưa được phân công cho ai (assignee null)', async () => {
    const task = { course: oid('c1'), assignee: null, status: 'unassigned' };
    Task.findById.mockResolvedValue(task);
    Course.findById.mockResolvedValue({ members: [{ user: oid('instructor1'), role: 'instructor' }] });

    const req = { params: { id: 't1' }, body: { status: 'done' }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await updateTaskStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('taskController.deleteTask', () => {
  beforeEach(() => jest.clearAllMocks());

  test('chỉ instructor/TA mới được xoá nhiệm vụ', async () => {
    const task = { course: oid('c1'), deleteOne: jest.fn().mockResolvedValue(undefined) };
    Task.findById.mockResolvedValue(task);
    Course.findById.mockResolvedValue({ members: [{ user: oid('student1'), role: 'student' }] });

    const req = { params: { id: 't1' }, user: { _id: oid('student1') } };
    const res = mockResponse();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(task.deleteOne).not.toHaveBeenCalled();
  });

  test('instructor xoá thành công', async () => {
    const task = { course: oid('c1'), deleteOne: jest.fn().mockResolvedValue(undefined) };
    Task.findById.mockResolvedValue(task);
    Course.findById.mockResolvedValue({ members: [{ user: oid('instructor1'), role: 'instructor' }] });

    const req = { params: { id: 't1' }, user: { _id: oid('instructor1') } };
    const res = mockResponse();

    await deleteTask(req, res);

    expect(task.deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
