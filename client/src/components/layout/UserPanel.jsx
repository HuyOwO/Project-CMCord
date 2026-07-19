// Panel hiển thị user hiện tại + nút đăng xuất, nằm ở đáy channel sidebar.
// Trước đây được copy y hệt trong cả HomePage và ChannelPage.
// displayName (tuỳ chọn): biệt danh của user trong server đang xem, mặc định lấy user.username.
export default function UserPanel({ user, onLogout, displayName }) {
  const name = displayName || user?.username;
  return (
    <div className="p-3 bg-cm-bg flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {name?.[0]?.toUpperCase()}
        </div>
        <span className="text-cm-text text-sm font-medium truncate">{name}</span>
      </div>
      <button onClick={onLogout} className="text-cm-muted hover:text-white text-xs flex-shrink-0">
        Đăng xuất
      </button>
    </div>
  );
}