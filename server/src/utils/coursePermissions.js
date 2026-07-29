// Vai trò trong 1 Course (instructor / ta / student), TÁCH BIỆT với vai trò Server.
const getCourseRole = (course, userId) => {
  const uid = userId.toString();
  const member = course.members.find((m) => (m.user._id || m.user).toString() === uid);
  return member ? member.role : null;
};

// instructor và TA đều được quản lý nội dung course (lesson, assignment) và chấm điểm
const canManageCourse = (role) => role === 'instructor' || role === 'ta';

// Chỉ instructor được xoá course, đổi role thành viên, xoá thành viên khỏi course
const isCourseInstructor = (role) => role === 'instructor';

module.exports = { getCourseRole, canManageCourse, isCourseInstructor };
