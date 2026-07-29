import { getRole, canModerateMember } from '../../utils/permissions';

const ROLE_LABEL = { owner: 'Chủ sở hữu', moderator: 'Moderator', member: 'Thành viên' };

// Panel danh sách thành viên (giống Discord), gom nhóm theo role.
// Các nút thăng/hạ/kick/ban chỉ hiện khi actor (currentUserId) có đủ quyền với từng người,
// dựa theo utils/permissions.js — không tự ý hiện nút rồi mới báo lỗi.
export default function MemberListPanel({ server, currentUserId, onPromote, onDemote, onKick, onBan, onMessage }) {
  if (!server) return null;

  const actorRole = getRole(server, currentUserId);
  const ownerId = server.owner?._id || server.owner;

  const members = server.members.map((m) => {
    const uid = m.user?._id || m.user;
    return { ...m, uid, role: uid === ownerId ? 'owner' : m.role };
  });

  const groups = ['owner', 'moderator', 'member']
    .map((role) => ({ role, list: members.filter((m) => m.role === role) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="w-60 bg-cm-sidebar flex flex-col border-l border-cm-border">
      <div className="px-4 py-3 border-b border-cm-border font-semibold text-white text-sm">
        Thành viên — {server.members.length}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {groups.map((g) => (
          <div key={g.role}>
            <div className="text-cm-muted text-xs font-semibold uppercase tracking-wide px-2 mb-1">
              {ROLE_LABEL[g.role]} — {g.list.length}
            </div>

            {g.list.map((m) => {
              const isSelf = m.uid === currentUserId;
              const canModerate = !isSelf && canModerateMember(actorRole, m.role);
              const canPromote = !isSelf && actorRole === 'owner' && m.role === 'member';
              const canDemote = !isSelf && actorRole === 'owner' && m.role === 'moderator';

              return (
                <div
                  key={m.uid}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-cm-input group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(m.nickname || m.user?.username)?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-cm-text text-sm truncate">
                        {m.nickname || m.user?.username}
                        {isSelf && <span className="text-cm-muted"> (Bạn)</span>}
                      </div>
                      {m.nickname && (
                        <div className="text-cm-muted text-xs truncate">@{m.user?.username}</div>
                      )}
                    </div>
                  </div>

                  {(canPromote || canDemote || canModerate || (!isSelf && onMessage)) && (
                    <div className="hidden group-hover:flex items-center gap-1.5 flex-shrink-0">
                      {!isSelf && onMessage && (
                        <button
                          onClick={() => onMessage(m.uid)}
                          title="Nhắn tin"
                          className="text-cm-muted hover:text-cm-accent text-xs"
                        >
                          💬
                        </button>
                      )}
                      {canPromote && (
                        <button
                          onClick={() => onPromote(m.uid)}
                          title="Thăng làm Moderator"
                          className="text-cm-muted hover:text-cm-green text-xs"
                        >
                          ↑
                        </button>
                      )}
                      {canDemote && (
                        <button
                          onClick={() => onDemote(m.uid)}
                          title="Hạ xuống Thành viên"
                          className="text-cm-muted hover:text-yellow-400 text-xs"
                        >
                          ↓
                        </button>
                      )}
                      {canModerate && (
                        <>
                          <button
                            onClick={() => onKick(m.uid)}
                            title="Kick khỏi server"
                            className="text-cm-muted hover:text-orange-400 text-xs"
                          >
                            ⏏
                          </button>
                          <button
                            onClick={() => onBan(m.uid)}
                            title="Ban khỏi server"
                            className="text-cm-muted hover:text-red-500 text-xs"
                          >
                            ⛔
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> milestone2-import
