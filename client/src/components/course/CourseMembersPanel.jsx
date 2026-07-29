const ROLE_LABEL = { instructor: 'Instructor', ta: 'TA', student: 'Student' };
const ROLE_ORDER = ['instructor', 'ta', 'student'];

// Danh sách thành viên khoá học, gom theo vai trò. Instructor có thêm nút thăng/hạ TA và xoá thành viên.
export default function CourseMembersPanel({ course, currentUserId, isInstructor, onPromoteTA, onDemoteTA, onRemove }) {
  const members = course?.members || [];
  const groups = ROLE_ORDER
    .map((role) => ({ role, list: members.filter((m) => m.role === role) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.role}>
          <div className="text-cm-muted text-xs font-semibold uppercase tracking-wide mb-2">
            {ROLE_LABEL[g.role]} — {g.list.length}
          </div>
          <div className="space-y-1">
            {g.list.map((m) => {
              const uid = m.user?._id || m.user;
              const isSelf = uid === currentUserId;
              return (
                <div key={uid} className="flex items-center gap-3 px-3 py-2 bg-cm-input rounded">
                  <div className="w-7 h-7 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {m.user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-cm-text text-sm flex-1 truncate">
                    {m.user?.username} {isSelf && <span className="text-cm-muted">(Bạn)</span>}
                  </span>
                  {isInstructor && !isSelf && g.role === 'student' && (
                    <button onClick={() => onPromoteTA(uid)} className="text-cm-green text-xs hover:underline flex-shrink-0">
                      Thăng TA
                    </button>
                  )}
                  {isInstructor && !isSelf && g.role === 'ta' && (
                    <button onClick={() => onDemoteTA(uid)} className="text-yellow-400 text-xs hover:underline flex-shrink-0">
                      Hạ Student
                    </button>
                  )}
                  {isInstructor && !isSelf && g.role !== 'instructor' && (
                    <button onClick={() => onRemove(uid)} className="text-red-400 text-xs hover:underline flex-shrink-0">
                      Xoá
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
