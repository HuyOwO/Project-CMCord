import UserPanel from '../layout/UserPanel';

// Lấy người còn lại trong cuộc trò chuyện 1-1 (khác với chính mình)
const getOtherParticipant = (conversation, currentUserId) =>
  conversation.participants.find((p) => p._id !== currentUserId) || conversation.participants[0];

const previewText = (lastMessage) => {
  if (!lastMessage) return 'Chưa có tin nhắn nào';
  if (lastMessage.fileUrl) return `📎 ${lastMessage.fileName || 'Tệp đính kèm'}`;
  return lastMessage.content;
};

// Sidebar 240px cho trang DM: danh sách hội thoại + nút tạo hội thoại mới + UserPanel.
// Cùng bố cục với ChannelSidebar để giao diện nhất quán khi chuyển qua lại.
export default function DMSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewMessageClick,
  onlineUsers,
  user,
  onLogout,
  onFriendsClick,
  isFriendsActive = false,
  pendingRequestCount = 0,
}) {
  return (
    <div className="w-60 bg-cm-sidebar flex flex-col">
      <div className="px-4 py-3 border-b border-cm-border flex items-center justify-between">
        <span className="font-semibold text-white text-sm">Tin nhắn</span>
        <button
          onClick={onNewMessageClick}
          title="Nhắn tin mới"
          className="text-cm-muted hover:text-white text-lg leading-none"
        >
          +
        </button>
      </div>

      <div className="p-2 border-b border-cm-border">
        <button
          onClick={onFriendsClick}
          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded text-left ${
            isFriendsActive ? 'bg-cm-input text-white' : 'text-cm-muted hover:bg-cm-input hover:text-cm-text'
          }`}
        >
          <span className="text-lg">👥</span>
          <span className="text-sm flex-1">Bạn bè</span>
          {pendingRequestCount > 0 && (
            <span className="inline-flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex-shrink-0">
              {pendingRequestCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {conversations.length === 0 && (
          <p className="text-cm-muted text-xs text-center px-2 py-4">
            Chưa có cuộc trò chuyện nào. Bấm + để bắt đầu nhắn tin.
          </p>
        )}

        {conversations.map((c) => {
          const other = getOtherParticipant(c, user?._id);
          const isOnline = onlineUsers?.has(other?._id);
          return (
            <button
              key={c._id}
              onClick={() => onSelectConversation(c)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded text-left ${
                c._id === activeConversationId ? 'bg-cm-input text-white' : 'text-cm-muted hover:bg-cm-input hover:text-cm-text'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold">
                  {other?.username?.[0]?.toUpperCase()}
                </div>
                {isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cm-green border-2 border-cm-sidebar" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate">{other?.username}</div>
                <div className="text-xs text-cm-muted truncate">{previewText(c.lastMessage)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <UserPanel user={user} onLogout={onLogout} />
    </div>
  );
}
