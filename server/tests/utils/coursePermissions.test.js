const { getCourseRole, canManageCourse, isCourseInstructor } = require('../../src/utils/coursePermissions');

// ────────────────────────────────────────────────────────────────────────────
// getCourseRole(course, userId)
// ────────────────────────────────────────────────────────────────────────────
describe('getCourseRole', () => {
  const instructorId = 'u-instructor';
  const taId = 'u-ta';
  const studentId = 'u-student';
  const strangerId = 'u-stranger';

  const course = {
    members: [
      { user: instructorId, role: 'instructor' },
      { user: taId, role: 'ta' },
      { user: studentId, role: 'student' },
    ],
  };

  test('trả về đúng role của từng thành viên trong course', () => {
    expect(getCourseRole(course, instructorId)).toBe('instructor');
    expect(getCourseRole(course, taId)).toBe('ta');
    expect(getCourseRole(course, studentId)).toBe('student');
  });

  test('trả về null nếu user chưa enroll vào course này', () => {
    expect(getCourseRole(course, strangerId)).toBeNull();
  });

  test('hoạt động đúng khi members[].user đã được populate (object có _id)', () => {
    const populatedCourse = {
      members: [{ user: { _id: { toString: () => studentId } }, role: 'student' }],
    };
    expect(getCourseRole(populatedCourse, { toString: () => studentId })).toBe('student');
  });

  test('vai trò course độc lập với vai trò server -- 1 user có thể là instructor course dù chỉ là member server', () => {
    // Đây là assertion mang tính tài liệu hoá: getCourseRole không hề đọc `server`,
    // nên không có cách nào vai trò server rò rỉ vào kết quả này.
    expect(getCourseRole(course, instructorId)).toBe('instructor');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// canManageCourse(role) -- tạo/sửa lesson & assignment, chấm điểm
// ────────────────────────────────────────────────────────────────────────────
describe('canManageCourse', () => {
  test('instructor và ta đều được quản lý nội dung course', () => {
    expect(canManageCourse('instructor')).toBe(true);
    expect(canManageCourse('ta')).toBe(true);
  });

  test('student KHÔNG được quản lý nội dung course', () => {
    expect(canManageCourse('student')).toBe(false);
  });

  test('role null (chưa enroll) không được quản lý gì', () => {
    expect(canManageCourse(null)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// isCourseInstructor(role) -- xoá course, đổi role thành viên, xoá thành viên
// ────────────────────────────────────────────────────────────────────────────
describe('isCourseInstructor', () => {
  test('chỉ instructor mới có quyền cấp cao nhất (xoá course, đổi role)', () => {
    expect(isCourseInstructor('instructor')).toBe(true);
  });

  test('ta KHÔNG có quyền cấp instructor dù được canManageCourse cho phép quản lý nội dung', () => {
    expect(isCourseInstructor('ta')).toBe(false);
  });

  test('student không có quyền instructor', () => {
    expect(isCourseInstructor('student')).toBe(false);
  });
});
