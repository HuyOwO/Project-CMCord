// Helpers xác định vai trò & quyền hạn trong 1 Course (Milestone 2 – Learning System).
// Vai trò course TÁCH BIỆT với vai trò server (owner/moderator/member):
// một người có thể là 'member' thường trong server nhưng là 'instructor' của course.
export const getCourseRole = (course, userId) => {
  if (!course || !userId) return null;
  const member = course.members?.find((m) => (m.user?._id || m.user) === userId);
  return member?.role || null;
};

// instructor và TA đều được tạo/sửa lesson, assignment, và chấm điểm
export const canManageCourse = (role) => role === 'instructor' || role === 'ta';

// Chỉ instructor được xoá course, đổi TA, xoá thành viên
export const isCourseInstructor = (role) => role === 'instructor';
