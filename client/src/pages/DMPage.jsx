import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { serverService, dmService, friendService } from '../services';
import AttachmentPreview from '../components/common/AttachmentPreview';
import ReactionPicker from '../components/common/ReactionPicker';
import { formatFileSize, MAX_FILE_SIZE } from '../utils/file';
import useAuth from '../hooks/useAuth';
import useSocket, { useOnlineUsers } from '../hooks/useSocket';
import useServerSelect from '../hooks/useServerSelect';
import ServerSidebar from '../components/server/ServerSidebar';
import DMSidebar from '../components/dm/DMSidebar';
import NewDMModal from '../components/dm/NewDMModal';
import FriendsPanel from '../components/dm/FriendsPanel';
import { resolveFileUrl } from '../config';

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
  const location            = useLocation();
  const { user, logout }   = useAuth();
  const socket             = useSocket();
  const onlineUsers        = useOnlineUsers();
  const navigate           = useNavigate();
  const goToServer         = useServerSelect();

  const isFriendsView = location.pathname === '/friends';

  const [servers, setServers]           = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileError, setFileError]       = useState('');
  const fileInputRef = useRef(null);
  const [typing, setTyping]             = useState([]);
  const [showNewDM, setShowNewDM]       = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue]       = useState('');
  const [friends, setFriends]           = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
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

  // Bạn bè + lời mời kết bạn -- cần load ở đây (không chỉ khi vào /friends) vì
  // DMSidebar luôn hiển thị số lời mời đang chờ dù đang xem trang nào trong /dm.
  const loadFriends = () => {
    friendService.getAll().then(({ friends, incomingRequests, outgoingRequests }) => {
      setFriends(friends);
      setIncomingRequests(incomingRequests);
      setOutgoingRequests(outgoingRequests);
    });
  };
  useEffect(loadFriends, []);

  // Lắng nghe thông báo kết bạn real-time (tới từ phòng riêng `user:<id>`, xem socketHandler.js)
  useEffect(() => {
    if (!socket) return;
    const handleReceived = () => loadFriends();
    const handleAccepted = () => loadFriends();
    const handleRemoved = () => loadFriends();
    socket.on('friend_request_received', handleReceived);
    socket.on('friend_request_accepted', handleAccepted);
    socket.on('friend_removed', handleRemoved);
    return () => {
      socket.off('friend_request_received', handleReceived);
      socket.off('friend_request_accepted', handleAccepted);
      socket.off('friend_removed', handleRemoved);
    };
  }, [socket]);

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

  const handleAcceptFriend = async (requestId) => {
    await friendService.accept(requestId);
    loadFriends();
  };
  const handleRemoveFriend = async (friendshipId) => {
    await friendService.remove(friendshipId);
    loadFriends();
  };
  const handleSendFriendRequest = async (username) => {
    await friendService.sendRequest(username);
    loadFriends();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File "${file.name}" vượt quá 8MB, vui lòng chọn file nhỏ hơn.`);
      return;
    }
    setFileError('');
    setAttachedFile(file);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || !conversationId) return;

    if (attachedFile) {
      // Có file đính kèm -> gửi qua REST (multipart/form-data), server sẽ tự
      // phát 'new_dm' qua socket cho cả 2 người sau khi lưu xong.
      try {
        await dmService.send(conversationId, input.trim(), attachedFile);
      } catch (err) {
        setFileError(err?.response?.data?.message || 'Gửi file thất bại, vui lòng thử lại.');
        return;
      }
    } else {
      socket
        ? socket.emit('send_dm', { conversationId, content: input.trim() })
        : await dmService.send(conversationId, input.trim());
    }

    setInput('');
    setAttachedFile(null);
    setFileError('');
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
        onFriendsClick={() => navigate('/friends')}
        isFriendsActive={isFriendsView}
        pendingRequestCount={incomingRequests.length}
      />

      <NewDMModal
        isOpen={showNewDM}
        onClose={() => setShowNewDM(false)}
        onSelectUser={handleStartConversation}
      />

      <div className="flex-1 flex flex-col bg-cm-surface">
        {isFriendsView ? (
          <FriendsPanel
            friends={friends}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onAccept={handleAcceptFriend}
            onRemove={handleRemoveFriend}
            onSendRequest={handleSendFriendRequest}
            onMessageUser={handleStartConversation}
            onlineUsers={onlineUsers}
          />
        ) : !conversation ? (
          <div className="flex-1 flex items-center justify-center text-cm-muted">
            Chọn một cuộc trò chuyện để bắt đầu, hoặc bấm + để nhắn tin mới
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-cm-border flex items-center gap-2 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {otherUser?.avatar ? (
                  <img src={resolveFileUrl(otherUser.avatar)} alt="" className="w-full h-full object-cover" />
                ) : (
                  otherUser?.username?.[0]?.toUpperCase()
                )}
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
                        <div className="w-10 h-10 rounded-full bg-cm-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                          {msg.sender.avatar ? (
                            <img src={resolveFileUrl(msg.sender.avatar)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.sender.username[0].toUpperCase()
                          )}
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
                          <AttachmentPreview fileUrl={msg.fileUrl} fileName={msg.fileName} fileType={msg.fileType} />
                        )}

                        {/* Reaction chips phóng to (text-sm, padding rộng hơn) để dễ bấm lại/gỡ react hơn */}
                        {msg.reactions?.length > 0 && (
                          <div className="flex gap-1.5 mt-1.5">
                            {msg.reactions.map((r) => (
                              <button
                                key={r.emoji}
                                onClick={() => handleReact(msg._id, r.emoji)}
                                className={`text-sm px-2 py-1 rounded-full border transition-colors ${
                                  r.users.includes(user?._id) ? 'border-cm-accent bg-cm-accent/10' : 'border-cm-border hover:border-cm-muted'
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
                              <button
                                onClick={() => startEditMessage(msg)}
                                title="Sửa tin nhắn"
                                className="text-cm-muted hover:text-white hover:bg-cm-input text-base p-1.5 rounded transition-colors"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                title="Xoá tin nhắn"
                                className="text-cm-muted hover:text-red-500 hover:bg-red-500/10 text-base p-1.5 rounded transition-colors"
                              >
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
              {attachedFile && (
                <div className="mb-1 px-3 py-1.5 bg-cm-input rounded flex items-center gap-2 text-xs">
                  <span>📎</span>
                  <span className="text-cm-text truncate flex-1">{attachedFile.name}</span>
                  <span className="text-cm-muted flex-shrink-0">{formatFileSize(attachedFile.size)}</span>
                  <button type="button" onClick={() => setAttachedFile(null)} className="text-cm-muted hover:text-white flex-shrink-0">✕</button>
                </div>
              )}
              {fileError && <p className="mb-1 text-red-400 text-xs">{fileError}</p>}

              {/* Icon đính kèm/gửi phóng to (text-xl) + bo tròn nền khi hover cho vùng bấm rộng hơn */}
              <div className="bg-cm-input rounded-lg flex items-center px-2 gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Đính kèm file (tối đa 8MB)"
                  className="text-cm-muted hover:text-white hover:bg-cm-border text-xl px-2.5 py-3 rounded-full flex-shrink-0 transition-colors"
                >
                  📎
                </button>
                <input
                  value={input}
                  onChange={handleTyping}
                  onBlur={() => socket?.emit('dm_stop_typing', { conversationId })}
                  placeholder={`Nhắn tin cho ${otherUser?.username || '...'}`}
                  className="flex-1 bg-transparent text-cm-text text-sm py-3 outline-none placeholder-cm-muted min-w-0"
                />
                <button
                  type="submit"
                  title="Gửi"
                  className="text-cm-muted hover:text-white hover:bg-cm-border text-xl px-2.5 py-2 rounded-full transition-colors flex-shrink-0"
                >
                  ➤
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
