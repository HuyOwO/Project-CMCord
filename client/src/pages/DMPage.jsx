import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serverService, dmService } from '../services';
import { resolveFileUrl } from '../config';
import useAuth from '../hooks/useAuth';
import useSocket, { useOnlineUsers } from '../hooks/useSocket';
import useServerSelect from '../hooks/useServerSelect';
import ServerSidebar from '../components/server/ServerSidebar';
import DMSidebar from '../components/dm/DMSidebar';
import NewDMModal from '../components/dm/NewDMModal';

const GROUP_GAP_MS = 5 * 60 * 1000;

const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const formatDateDivider = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export default function DMPage() {
  const { conversationId } = useParams();
  const { user, logout }   = useAuth();
  const socket             = useSocket();
  const onlineUsers        = useOnlineUsers();
  const navigate           = useNavigate();
  const goToServer         = useServerSelect();

  const [servers, setServers]           = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [typing, setTyping]             = useState([]);
  const [showNewDM, setShowNewDM]       = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue]       = useState('');
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversation = conversations.find((c) => c._id === conversationId);
  const otherUser = conversation?.participants.find((p) => p._id !== user?._id);

  // Server list cho ServerSidebar (dùng chung layout với HomePage/ChannelPage)
  useEffect(() => {
    serverService.getAll().then(setServers);
  }, []);

  // Danh sách hội thoại
  useEffect(() => {
    dmService.getConversations().then(setConversations);
  }, []);

  // Tin nhắn của hội thoại đang mở
  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    dmService.getMessages(conversationId).then(setMessages);
  }, [conversationId]);

  // Join phòng socket của TẤT CẢ hội thoại đang có, để danh sách bên trái
  // luôn cập nhật preview/thứ tự real-time kể cả khi không mở đúng hội thoại đó.
  useEffect(() => {
    if (!socket) return;
    conversations.forEach((c) => socket.emit('join_dm', { conversationId: c._id }));
    return () => conversations.forEach((c) => socket.emit('leave_dm', { conversationId: c._id }));
  }, [socket, conversations.map((c) => c._id).join(',')]);

  // Lắng nghe sự kiện real-time
  useEffect(() => {
    if (!socket) return;
    setTyping([]);

    const handleNewDM = (msg) => {
      if (msg.conversation === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c._id === msg.conversation ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt } : c
        );
        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });
    };
    const handleEdited = (msg) =>
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    const handleDeleted = ({ messageId }) =>
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    const handleReacted = (msg) =>
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    const handleTyping = ({ userId, username }) =>
      setTyping((prev) => (prev.some((t) => t.userId === userId) ? prev : [...prev, { userId, username }]));
    const handleStopTyping = ({ userId }) =>
      setTyping((prev) => prev.filter((t) => t.userId !== userId));

    socket.on('new_dm', handleNewDM);
    socket.on('dm_edited', handleEdited);
    socket.on('dm_deleted', handleDeleted);
    socket.on('dm_reacted', handleReacted);
    socket.on('dm_user_typing', handleTyping);
    socket.on('dm_user_stop_typing', handleStopTyping);

    return () => {
      clearTimeout(typingTimeoutRef.current);
      socket.off('new_dm', handleNewDM);
      socket.off('dm_edited', handleEdited);
      socket.off('dm_deleted', handleDeleted);
      socket.off('dm_reacted', handleReacted);
      socket.off('dm_user_typing', handleTyping);
      socket.off('dm_user_stop_typing', handleStopTyping);
    };
  }, [socket, conversationId]);

  // Tự scroll xuống khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartConversation = async (userId) => {
    const convo = await dmService.getOrCreate(userId);
    const list = await dmService.getConversations();
    setConversations(list);
    setShowNewDM(false);
    navigate(`/dm/${convo._id}`);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    socket
      ? socket.emit('send_dm', { conversationId, content: input.trim() })
      : await dmService.send(conversationId, input.trim());
    setInput('');
    clearTimeout(typingTimeoutRef.current);
    socket?.emit('dm_stop_typing', { conversationId });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket?.emit('dm_typing', { conversationId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('dm_stop_typing', { conversationId });
    }, 3000);
  };

  const startEditMessage = (msg) => {
    setEditingMessageId(msg._id);
    setEditValue(msg.content);
  };
  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditValue('');
  };
  const saveEditMessage = async () => {
    if (!editValue.trim()) return;
    const updated = await dmService.update(editingMessageId, editValue.trim());
    setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
    setEditingMessageId(null);
    setEditValue('');
  };
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Xoá tin nhắn này?')) return;
    await dmService.remove(messageId);
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };
  const handleReact = async (messageId, emoji = '👍') => {
    const updated = await dmService.toggleReaction(messageId, emoji);
    setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
  };

  return (
    <div className="flex h-screen bg-cm-bg overflow-hidden">
      <ServerSidebar
        servers={servers}
        activeServerId={null}
        activeHome
        onSelectServer={goToServer}
        onCreateClick={() => navigate('/')}
        onHomeClick={() => navigate('/dm')}
      />

      <DMSidebar
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={(c) => navigate(`/dm/${c._id}`)}
        onNewMessageClick={() => setShowNewDM(true)}
        onlineUsers={onlineUsers}
        user={user}
        onLogout={logout}
      />

      <NewDMModal
        isOpen={showNewDM}
        onClose={() => setShowNewDM(false)}
        onSelectUser={handleStartConversation}
      />

      <div className="flex-1 flex flex-col bg-cm-surface">
        {!conversation ? (
          <div className="flex-1 flex items-center justify-center text-cm-muted">
            Chọn một cuộc trò chuyện để bắt đầu, hoặc bấm + để nhắn tin mới
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-cm-border flex items-center gap-2 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold">
                {otherUser?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-white font-semibold">{otherUser?.username}</span>
              {onlineUsers.has(otherUser?._id) && (
                <span className="text-cm-green text-xs">● Online</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.map((msg, i) => {
                const prev = i > 0 ? messages[i - 1] : null;
                const newDay = !prev || !isSameDay(prev.createdAt, msg.createdAt);
                const sameSender = prev && prev.sender._id === msg.sender._id;
                const withinGroupGap =
                  prev && new Date(msg.createdAt) - new Date(prev.createdAt) < GROUP_GAP_MS;
                const showHeader = !prev || !sameSender || !withinGroupGap || newDay;

                return (
                  <div key={msg._id}>
                    {newDay && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-cm-border" />
                        <span className="text-xs text-cm-muted font-semibold px-1">
                          {formatDateDivider(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-cm-border" />
                      </div>
                    )}
                    <div className={`flex gap-3 ${showHeader && !newDay ? 'mt-4' : ''} group`}>
                      {showHeader ? (
                        <div className="w-10 h-10 rounded-full bg-cm-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {msg.sender.username[0].toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-white text-sm font-semibold">{msg.sender.username}</span>
                            <span className="text-cm-muted text-xs">{formatTime(msg.createdAt)}</span>
                          </div>
                        )}

                        {editingMessageId === msg._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); saveEditMessage(); }
                                if (e.key === 'Escape') cancelEditMessage();
                              }}
                              className="flex-1 bg-cm-input text-cm-text text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-cm-accent"
                            />
                            <button onClick={saveEditMessage} className="text-cm-accent text-xs hover:underline">Lưu</button>
                            <button onClick={cancelEditMessage} className="text-cm-muted text-xs hover:underline">Hủy</button>
                          </div>
                        ) : (
                          <p className="text-cm-text text-sm leading-relaxed">
                            {msg.content}
                            {msg.isEdited && <span className="text-cm-muted text-xs ml-1">(đã chỉnh sửa)</span>}
                          </p>
                        )}

                        {msg.fileUrl && (
                          <a href={resolveFileUrl(msg.fileUrl)} target="_blank" rel="noreferrer"
                            className="text-cm-accent text-xs hover:underline mt-1 block">
                            📎 Tải file đính kèm
                          </a>
                        )}

                        {msg.reactions?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {msg.reactions.map((r) => (
                              <button
                                key={r.emoji}
                                onClick={() => handleReact(msg._id, r.emoji)}
                                className={`text-xs px-1.5 py-0.5 rounded-full border ${
                                  r.users.includes(user?._id) ? 'border-cm-accent bg-cm-accent/10' : 'border-cm-border'
                                }`}
                              >
                                {r.emoji} {r.users.length}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {editingMessageId !== msg._id && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 flex-shrink-0 self-start">
                          <button onClick={() => handleReact(msg._id)} title="Thả cảm xúc" className="text-cm-muted hover:text-white text-xs">
                            😀
                          </button>
                          {msg.sender._id === user?._id && (
                            <>
                              <button onClick={() => startEditMessage(msg)} title="Sửa tin nhắn" className="text-cm-muted hover:text-white text-xs">
                                ✏️
                              </button>
                              <button onClick={() => handleDeleteMessage(msg._id)} title="Xoá tin nhắn" className="text-cm-muted hover:text-red-500 text-xs">
                                🗑
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="h-5 px-4">
              {typing.length > 0 && (
                <p className="text-cm-muted text-xs italic">
                  {typing.map((t) => t.username).join(', ')} đang gõ...
                </p>
              )}
            </div>

            <form onSubmit={sendMessage} className="px-4 pb-4">
              <div className="bg-cm-input rounded-lg flex items-center px-4 gap-3">
                <input
                  value={input}
                  onChange={handleTyping}
                  onBlur={() => socket?.emit('dm_stop_typing', { conversationId })}
                  placeholder={`Nhắn tin cho ${otherUser?.username || '...'}`}
                  className="flex-1 bg-transparent text-cm-text text-sm py-3 outline-none placeholder-cm-muted"
                />
                <button type="submit" className="text-cm-muted hover:text-white transition-colors">➤</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
