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

// Milestone 4: Kiểu khoá học -- chọn khi TẠO course, không đổi được sau đó.
// 'general' (Đại cương): giữ nguyên luồng Bài học + Bài tập + Nộp bài + Chấm điểm.
// 'major' (Chuyên ngành): thay "Bài tập" bằng "Nhiệm vụ" kiểu issue-tracker
// (phân công cho 1 người + theo dõi tiến trình qua bảng Kanban 3 cột màu).
export const COURSE_TYPES = [
  { value: 'general', label: 'Đại cương', hint: 'Bài học • Bài tập • Nộp bài • Chấm điểm' },
  { value: 'major', label: 'Chuyên ngành', hint: 'Bài học • Nhiệm vụ • Phân công • Theo dõi tiến trình' },
];
export const COURSE_TYPE_LABEL = Object.fromEntries(COURSE_TYPES.map((t) => [t.value, t.label]));
export const isMajorCourse = (course) => course?.type === 'major';

// Trạng thái Nhiệm vụ (Task) trong course chuyên ngành, ứng với 3 cột trên bảng Kanban.
export const TASK_STATUS_META = {
  unassigned:  { label: 'Chưa phân công', dotClass: 'bg-red-500',    badgeClass: 'bg-red-500/10 text-red-400 border border-red-900' },
  in_progress: { label: 'Đang làm',       dotClass: 'bg-yellow-400', badgeClass: 'bg-yellow-400/10 text-yellow-400 border border-yellow-800' },
  done:        { label: 'Đã xong',        dotClass: 'bg-cm-green',  badgeClass: 'bg-cm-green/10 text-cm-green border border-green-900' },
};
export const TASK_STATUS_ORDER = ['unassigned', 'in_progress', 'done'];
