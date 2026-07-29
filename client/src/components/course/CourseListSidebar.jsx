import UserPanel from '../layout/UserPanel';

// Sidebar 240px cho không gian "Khóa học" của 1 server: link quay lại kênh chat,
// danh sách course, nút tạo/tham gia course, UserPanel. Bố cục nhất quán với ChannelSidebar.
export default function CourseListSidebar({
  server,
  courses,
  activeCourseId,
  onSelectCourse,
  onBackToChannels,
  canCreateCourse = false,
  onCreateClick,
  onJoinClick,
  user,
  onLogout,
}) {
  return (
    <div className="w-60 bg-cm-sidebar flex flex-col">
      <div className="px-4 py-3 border-b border-cm-border">
        <div className="font-semibold text-white text-sm truncate">{server?.name}</div>
        <button
          onClick={onBackToChannels}
          className="text-cm-muted hover:text-white text-xs mt-0.5"
        >
          ← Quay lại kênh chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-cm-muted text-xs font-semibold uppercase tracking-wide">
            🎓 Khoá học
          </span>
          <div className="flex items-center gap-1">
            {canCreateCourse && (
              <button
                onClick={onCreateClick}
                title="Tạo khoá học mới"
                className="text-cm-muted hover:text-white text-lg leading-none"
              >
                +
              </button>
            )}
            <button
              onClick={onJoinClick}
              title="Tham gia khoá học bằng mã mời"
              className="text-cm-muted hover:text-white text-sm leading-none"
            >
              🔗
            </button>
          </div>
        </div>

        {courses.length === 0 && (
          <p className="text-cm-muted text-xs px-2 py-3">
            Chưa có khoá học nào trong server này.
          </p>
        )}

        {courses.map((course) => (
          <button
            key={course._id}
            onClick={() => onSelectCourse(course)}
            className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
              course._id === activeCourseId
                ? 'bg-cm-input text-white'
                : 'text-cm-muted hover:bg-cm-input hover:text-cm-text'
            }`}
          >
            <span>📘</span> <span className="truncate">{course.name}</span>
          </button>
        ))}
      </div>

      <UserPanel user={user} onLogout={onLogout} />
    </div>
  );
}
