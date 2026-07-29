import { useState } from 'react';
import UserPanel from '../layout/UserPanel';

// Sidebar 240px: tên server + danh sách channel + UserPanel.
// Trước đây được copy gần như y hệt trong HomePage và ChannelPage,
// chỉ khác cách highlight channel đang active.
//
// Milestone 2 (Learning System): thêm mục "🎓 Khóa học" ngay trên danh sách
// channel, dẫn sang không gian học tập (Course) của server này.
export default function ChannelSidebar({
  server,
  channels,
  activeChannelId,
  onSelectChannel,
  user,
  onLogout,
  canCreateChannel = false,
  onCreateChannelClick,
  onInviteClick,
  onRenameChannelClick,
  onDeleteChannelClick,
  isOwner = false,
  onSettingsClick,
  onNicknameClick,
  onLeaveClick,
  displayName,
  onCoursesClick,
  isCoursesActive = false,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [serverMenuOpen, setServerMenuOpen] = useState(false);

  return (
    <div className="w-60 bg-cm-sidebar flex flex-col">
      <div className="px-4 py-3 border-b border-cm-border relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => server && setServerMenuOpen((v) => !v)}
            className="font-semibold text-white text-sm truncate flex items-center gap-1 min-w-0"
            disabled={!server}
          >
            <span className="truncate">{server ? server.name : 'Chọn một server'}</span>
            {server && <span className="text-cm-muted text-xs flex-shrink-0">▾</span>}
          </button>
          {server && onInviteClick && (
            <button
              onClick={onInviteClick}
              title="Mời mọi người"
              className="text-cm-muted hover:text-white text-xs flex-shrink-0 ml-2"
            >
              Mời
            </button>
          )}
        </div>

        {serverMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setServerMenuOpen(false)} />
            <div className="absolute left-2 right-2 top-full mt-1 z-50 bg-cm-bg border border-cm-border rounded shadow-lg py-1">
              {isOwner && (
                <button
                  onClick={() => { setServerMenuOpen(false); onSettingsClick(); }}
                  className="w-full text-left px-3 py-2 text-sm text-cm-text hover:bg-cm-input"
                >
                  ⚙️ Cài đặt máy chủ
                </button>
              )}
              <button
                onClick={() => { setServerMenuOpen(false); onNicknameClick(); }}
                className="w-full text-left px-3 py-2 text-sm text-cm-text hover:bg-cm-input"
              >
                🙂 Đổi biệt danh của bạn
              </button>
              {!isOwner && (
                <button
                  onClick={() => { setServerMenuOpen(false); onLeaveClick(); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-cm-input"
                >
                  🚪 Rời server
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {server && onCoursesClick && (
          <button
            onClick={onCoursesClick}
            className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-1.5 mb-1 ${
              isCoursesActive
                ? 'bg-cm-input text-white'
                : 'text-cm-muted hover:bg-cm-input hover:text-cm-text'
            }`}
          >
            <span>🎓</span> <span className="truncate">Khóa học</span>
          </button>
        )}

        {server && (
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-cm-muted text-xs font-semibold uppercase tracking-wide">
              Kênh văn bản
            </span>
            {canCreateChannel && (
              <button
                onClick={onCreateChannelClick}
                title="Tạo channel mới"
                className="text-cm-muted hover:text-white text-lg leading-none"
              >
                +
              </button>
            )}
          </div>
        )}

        {channels.map((ch) => (
          <div key={ch._id} className="relative group">
            <button
              onClick={() => onSelectChannel(ch)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-1.5 pr-7 ${
                ch._id === activeChannelId
                  ? 'bg-cm-input text-white'
                  : 'text-cm-muted hover:bg-cm-input hover:text-cm-text'
              }`}
            >
              <span>#</span> <span className="truncate">{ch.name}</span>
            </button>

            {canCreateChannel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === ch._id ? null : ch._id);
                }}
                title="Quản lý channel"
                className="hidden group-hover:block absolute right-1 top-1/2 -translate-y-1/2 text-cm-muted hover:text-white px-1"
              >
                ⋮
              </button>
            )}

            {openMenuId === ch._id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                <div className="absolute right-1 top-full mt-1 z-50 bg-cm-bg border border-cm-border rounded shadow-lg py-1 w-32">
                  <button
                    onClick={() => { setOpenMenuId(null); onRenameChannelClick(ch); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-cm-text hover:bg-cm-input"
                  >
                    Đổi tên
                  </button>
                  <button
                    onClick={() => { setOpenMenuId(null); onDeleteChannelClick(ch); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-cm-input"
                  >
                    Xoá channel
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <UserPanel user={user} onLogout={onLogout} displayName={displayName} />
    </div>
  );
}
