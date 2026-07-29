import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService, channelService, serverService, dmService } from '../services';
import { resolveFileUrl } from '../config';
import { formatFileSize, MAX_FILE_SIZE } from '../utils/file';
import useAuth   from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import useServerSelect from '../hooks/useServerSelect';
import ServerSidebar from '../components/server/ServerSidebar';
import ChannelSidebar from '../components/channel/ChannelSidebar';
import CreateChannelModal from '../components/channel/CreateChannelModal';
import InviteModal from '../components/server/InviteModal';
import JoinServerModal from '../components/server/JoinServerModal';
import MemberListPanel from '../components/server/MemberListPanel';
import SearchModal from '../components/server/SearchModal';
import ServerSettingsModal from '../components/server/ServerSettingsModal';
import NicknameModal from '../components/server/NicknameModal';
import { getRole, canDeleteMessage, getDisplayName } from '../utils/permissions';

export default function ChannelPage() {
  const { serverId, channelId } = useParams();
  const { user, logout }         = useAuth();
  const socket                   = useSocket();
  const navigate                 = useNavigate();
  const goToServer               = useServerSelect();

  const [messages,  setMessages]  = useState([]);
  const [channels,  setChannels]  = useState([]);
  const [servers,   setServers]   = useState([]);
  const [server,    setServer]    = useState(null);
  const [input,     setInput]     = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  const [typing,    setTyping]    = useState([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [renamingChannel, setRenamingChannel] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showNickname, setShowNickname] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null); // null = không đang gõ mention
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Danh sách toàn bộ server (để ServerSidebar hiển thị đầy đủ, không chỉ 1 icon như trước)
  useEffect(() => {
    serverService.getAll().then(setServers);
  }, []);

  // Load dữ liệu ban đầu
  useEffect(() => {
    serverService.getOne(serverId).then(setServer);
    channelService.getAll(serverId).then(setChannels);
    messageService.getAll(channelId).then(setMessages);
  }, [serverId, channelId]);

  // Socket: join channel và lắng nghe sự kiện
  useEffect(() => {
    if (!socket) return;
    setTyping([]); // reset khi chuyển channel/server, tránh state "đang gõ" cũ bị treo lại
    socket.emit('join_channel', { channelId });
    socket.on('new_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('message_deleted', ({ messageId }) =>
      setMessages(prev => prev.filter(m => m._id !== messageId))
    );
    socket.on('message_edited', (updatedMsg) =>
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m))
    );
    socket.on('message_pinned', (updatedMsg) =>
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m))
    );
    socket.on('message_reacted', (updatedMsg) =>
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m))
    );
    socket.on('user_typing', ({ userId, username }) =>
      setTyping(prev => prev.some(t => t.userId === userId) ? prev : [...prev, { userId, username }])
    );
    socket.on('user_stop_typing', ({ userId }) =>
      setTyping(prev => prev.filter(t => t.userId !== userId))
    );
    return () => {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('leave_channel', { channelId });
      socket.off('new_message');
      socket.off('message_deleted');
      socket.off('message_edited');
      socket.off('message_pinned');
      socket.off('message_reacted');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, channelId]);

  // Tự scroll xuống khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Phím tắt Ctrl/Cmd+K để mở tìm kiếm (giống Discord/Slack)
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // cho phép chọn lại đúng file đó lần sau nếu người dùng bỏ rồi chọn lại
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
    if (!input.trim() && !attachedFile) return;

    if (attachedFile) {
      // Có file đính kèm -> bắt buộc gửi qua REST (multipart/form-data),
      // Socket.io không xử lý được upload file. Server sẽ tự phát 'new_message'
      // qua socket cho cả channel (kể cả người gửi) sau khi lưu xong.
      try {
        await messageService.send(channelId, input.trim(), attachedFile, replyingTo?._id);
      } catch (err) {
        setFileError(err?.response?.data?.message || 'Gửi file thất bại, vui lòng thử lại.');
        return;
      }
    } else {
      socket
        ? socket.emit('send_message', { channelId, content: input.trim(), replyTo: replyingTo?._id })
        : await messageService.send(channelId, input.trim(), null, replyingTo?._id);
    }

    setInput('');
    setAttachedFile(null);
    setFileError('');
    setReplyingTo(null);
    clearTimeout(typingTimeoutRef.current);
    socket?.emit('stop_typing', { channelId });
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    socket?.emit('typing', { channelId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stop_typing', { channelId });
    }, 3000);

    // Phát hiện đang gõ @xxx ở cuối chuỗi (chưa có dấu cách sau @)
    const match = value.slice(0, e.target.selectionStart).match(/@(\w*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const insertMention = (username) => {
    const before = input.replace(/@(\w*)$/, '');
    setInput(`${before}@${username} `);
    setMentionQuery(null);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // Sau khoảng thời gian này (ms) thì dù cùng người gửi vẫn tách thành nhóm mới (giống Discord ~5-7 phút)
  const GROUP_GAP_MS = 5 * 60 * 1000;

  const isSameDay = (a, b) =>
    new Date(a).toDateString() === new Date(b).toDateString();

  const formatDateDivider = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const currentChannel = channels.find(c => c._id === channelId);
  const actorRole = getRole(server, user?._id);
  const canCreateChannel = actorRole === 'owner';
  const myNickname = server?.members?.find(m => (m.user?._id || m.user) === user?._id)?.nickname || '';
  const myDisplayName = getDisplayName(server, user?._id, user?.username);

  const createChannel = async (name) => {
    const ch = await channelService.create(serverId, name);
    setChannels(prev => [...prev, ch]);
    setShowCreateChannel(false);
    navigate(`/channels/${serverId}/${ch._id}`);
  };

  const handleRenameChannel = async (name) => {
    const updated = await channelService.update(serverId, renamingChannel._id, name);
    setChannels(prev => prev.map(c => c._id === updated._id ? updated : c));
    setRenamingChannel(null);
  };

  const handleDeleteChannel = async (channel) => {
    if (!window.confirm(`Xoá channel #${channel.name}? Toàn bộ tin nhắn trong đó cũng sẽ mất.`)) return;
    await channelService.remove(serverId, channel._id);
    const remaining = channels.filter(c => c._id !== channel._id);
    setChannels(remaining);
    // Đang xem đúng channel bị xoá -> nhảy sang channel khác còn lại, hoặc về trang chủ nếu hết channel
    if (channel._id === channelId) {
      if (remaining.length > 0) navigate(`/channels/${serverId}/${remaining[0]._id}`);
      else navigate('/');
    }
  };

  // Tham gia 1 server khác bằng mã mời -> nhảy vào channel đầu tiên của server đó
  const handleJoinServer = async (inviteCode) => {
    const srv = await serverService.join(inviteCode);
    setServers(prev => [...prev, srv]);
    const chs = await channelService.getAll(srv._id);
    setShowJoin(false);
    if (chs.length > 0) navigate(`/channels/${srv._id}/${chs[0]._id}`);
  };

  const handlePromote = async (userId) => {
    await serverService.updateMemberRole(serverId, userId, 'moderator');
    serverService.getOne(serverId).then(setServer);
  };

  const handleDemote = async (userId) => {
    await serverService.updateMemberRole(serverId, userId, 'member');
    serverService.getOne(serverId).then(setServer);
  };

  const handleKick = async (userId) => {
    if (!window.confirm('Kick thành viên này khỏi server?')) return;
    await serverService.kickMember(serverId, userId);
    serverService.getOne(serverId).then(setServer);
  };

  const handleBan = async (userId) => {
    if (!window.confirm('Ban thành viên này? Họ sẽ không thể tham gia lại bằng mã mời.')) return;
    await serverService.banMember(serverId, userId);
    serverService.getOne(serverId).then(setServer);
  };

  const handleMessageMember = async (userId) => {
    const convo = await dmService.getOrCreate(userId);
    navigate(`/dm/${convo._id}`);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Xoá tin nhắn này?')) return;
    await messageService.remove(messageId);
    setMessages(prev => prev.filter(m => m._id !== messageId));
  };

  const handleUpdateServer = async ({ name, description }) => {
    const updated = await serverService.update(serverId, { name, description });
    setServer(updated);
    setServers(prev => prev.map(s => s._id === updated._id ? updated : s));
    setShowServerSettings(false);
  };

  const handleDeleteServer = async () => {
    if (!window.confirm(`Xoá vĩnh viễn server "${server?.name}"? Hành động này KHÔNG thể hoàn tác.`)) return;
    await serverService.remove(serverId);
    setServers(prev => prev.filter(s => s._id !== serverId));
    navigate('/');
  };

  const handleUpdateNickname = async (nickname) => {
    const updated = await serverService.updateNickname(serverId, nickname);
    setServer(updated);
    setShowNickname(false);
  };

  const handleLeaveServer = async () => {
    if (!window.confirm(`Rời khỏi server "${server?.name}"?`)) return;
    await serverService.leave(serverId);
    setServers(prev => prev.filter(s => s._id !== serverId));
    navigate('/');
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
    const updated = await messageService.update(editingMessageId, editValue.trim());
    setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    setEditingMessageId(null);
    setEditValue('');
  };

  const handleTogglePin = async (messageId) => {
    const updated = await messageService.togglePin(messageId);
    setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
  };

  const handleReact = async (messageId, emoji = '👍') => {
    const updated = await messageService.toggleReaction(messageId, emoji);
    setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
  };

  return (
    <div className="flex h-screen bg-cm-bg overflow-hidden">
      <ServerSidebar
        servers={servers}
        activeServerId={serverId}
        onSelectServer={goToServer}
        onCreateClick={() => navigate('/')}
        onJoinClick={() => setShowJoin(true)}
        onHomeClick={() => navigate('/dm')}
      />

      <ChannelSidebar
        server={server}
        channels={channels}
        activeChannelId={channelId}
        onSelectChannel={(ch) => navigate(`/channels/${serverId}/${ch._id}`)}
        user={user}
        onLogout={logout}
        canCreateChannel={canCreateChannel}
        onCreateChannelClick={() => setShowCreateChannel(true)}
        onInviteClick={() => setShowInvite(true)}
        onRenameChannelClick={(ch) => setRenamingChannel(ch)}
        onDeleteChannelClick={handleDeleteChannel}
        isOwner={actorRole === 'owner'}
        onSettingsClick={() => setShowServerSettings(true)}
        onNicknameClick={() => setShowNickname(true)}
        onLeaveClick={handleLeaveServer}
        displayName={myDisplayName}
<<<<<<< HEAD
=======
        onCoursesClick={() => navigate(`/servers/${serverId}/courses`)}
>>>>>>> milestone2-import
      />

      <CreateChannelModal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        onCreate={createChannel}
      />

      <CreateChannelModal
        isOpen={!!renamingChannel}
        onClose={() => setRenamingChannel(null)}
        onCreate={handleRenameChannel}
        channel={renamingChannel}
      />

      <ServerSettingsModal
        isOpen={showServerSettings}
        onClose={() => setShowServerSettings(false)}
        server={server}
        onSave={handleUpdateServer}
        onDeleteServer={handleDeleteServer}
      />

      <NicknameModal
        isOpen={showNickname}
        onClose={() => setShowNickname(false)}
        currentNickname={myNickname}
        onSave={handleUpdateNickname}
      />

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        server={server}
      />

      <JoinServerModal
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        onJoin={handleJoinServer}
      />

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        server={server}
        onJumpToChannel={(chId) => navigate(`/channels/${serverId}/${chId}`)}
        onMessageUser={handleMessageMember}
        currentUserId={user?._id}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-cm-surface">
        {/* Header */}
        <div className="px-4 py-3 border-b border-cm-border flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-cm-muted text-lg">#</span>
            <span className="text-white font-semibold">{currentChannel?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(true)}
              title="Tìm kiếm (Ctrl+K)"
              className="text-sm px-2 py-1 rounded text-cm-muted hover:text-white"
            >
              🔍
            </button>
            <button
              onClick={() => setShowMembers(v => !v)}
              title="Danh sách thành viên"
              className={`text-sm px-2 py-1 rounded ${showMembers ? 'text-white bg-cm-input' : 'text-cm-muted hover:text-white'}`}
            >
              👥 {server?.members?.length ?? ''}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {messages.map((msg, i) => {
            const prev = i > 0 ? messages[i - 1] : null;

            const newDay = !prev || !isSameDay(prev.createdAt, msg.createdAt);
            const sameAuthor = prev && prev.author._id === msg.author._id;
            const withinGroupGap =
              prev && new Date(msg.createdAt) - new Date(prev.createdAt) < GROUP_GAP_MS;

            // Nhóm mới khi: người đầu tiên, đổi người gửi, cách nhau quá lâu, hoặc sang ngày mới
            const showHeader = !prev || !sameAuthor || !withinGroupGap || newDay;

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
                      {getDisplayName(server, msg.author._id, msg.author.username)[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-10 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {showHeader && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-white text-sm font-semibold">
                          {getDisplayName(server, msg.author._id, msg.author.username)}
                        </span>
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
                        {msg.reactions.map(r => (
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
                    <button
                        onClick={() => setReplyingTo(msg)}
                        title="Trả lời"
                        className="text-cm-muted hover:text-white text-xs"
                      >
                        ↩️
                      </button>
                      <button
                        onClick={() => handleReact(msg._id)}
                        title="Thả cảm xúc"
                        className="text-cm-muted hover:text-white text-xs"
                      >
                        😀
                      </button>
                      <button
                        onClick={() => handleTogglePin(msg._id)}
                        title={msg.isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                        className={`text-xs ${msg.isPinned ? 'text-cm-accent' : 'text-cm-muted hover:text-white'}`}
                      >
                        📌
                      </button>
                      {msg.author._id === user?._id && (
                        <button
                          onClick={() => startEditMessage(msg)}
                          title="Sửa tin nhắn"
                          className="text-cm-muted hover:text-white text-xs"
                        >
                          ✏️
                        </button>
                      )}
                      {(msg.author._id === user?._id || canDeleteMessage(actorRole, getRole(server, msg.author._id))) && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          title="Xoá tin nhắn"
                          className="text-cm-muted hover:text-red-500 text-xs"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Typing indicator - cố định ngay trên ô input, không cuộn theo tin nhắn */}
        <div className="h-5 px-4">
          {typing.length > 0 && (
            <p className="text-cm-muted text-xs italic">
              {typing.map(t => getDisplayName(server, t.userId, t.username)).join(', ')} đang gõ...
            </p>
          )}
        </div>

        {/* Input */}
        {replyingTo && (
          <div className="mx-4 mb-1 px-3 py-1.5 bg-cm-input rounded flex items-center justify-between text-xs">
            <span className="text-cm-muted">
              Đang trả lời <span className="text-white">{getDisplayName(server, replyingTo.author._id, replyingTo.author.username)}</span>
            </span>
            <button onClick={() => setReplyingTo(null)} className="text-cm-muted hover:text-white">✕</button>
          </div>
        )}
        {mentionQuery !== null && (
  <div className="mx-4 mb-1 bg-cm-bg border border-cm-border rounded shadow-lg max-h-40 overflow-y-auto">
    {server?.members
      ?.filter(m => m.user?.username?.toLowerCase().startsWith(mentionQuery.toLowerCase()))
      .map(m => (
        <button
          key={m.user._id}
          type="button"
          onClick={() => insertMention(m.user.username)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-cm-text hover:bg-cm-input text-left"
        >
          <div className="w-5 h-5 rounded-full bg-cm-accent flex items-center justify-center text-white text-[10px] font-bold">
            {m.user.username?.[0]?.toUpperCase()}
          </div>
          {m.user.username}
        </button>
      ))}
  </div>
)}

        {attachedFile && (
          <div className="mx-4 mb-1 px-3 py-1.5 bg-cm-input rounded flex items-center gap-2 text-xs">
            <span>📎</span>
            <span className="text-cm-text truncate flex-1">{attachedFile.name}</span>
            <span className="text-cm-muted flex-shrink-0">{formatFileSize(attachedFile.size)}</span>
            <button type="button" onClick={() => setAttachedFile(null)} className="text-cm-muted hover:text-white flex-shrink-0">✕</button>
          </div>
        )}
        {fileError && <p className="mx-4 mb-1 text-red-400 text-xs">{fileError}</p>}

        <form onSubmit={sendMessage} className="px-4 pb-4">
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
              className="text-cm-muted hover:text-white text-lg px-2 py-3 flex-shrink-0"
            >
              📎
            </button>
            <input
              value={input}
              onChange={handleTyping}
              onBlur={() => socket?.emit('stop_typing', { channelId })}
              placeholder={`Nhắn tin #${currentChannel?.name || '...'}`}
              className="flex-1 bg-transparent text-cm-text text-sm py-3 outline-none placeholder-cm-muted min-w-0"
            />
            <button type="submit" className="text-cm-muted hover:text-white transition-colors px-2 flex-shrink-0">
              ➤
            </button>
          </div>
        </form>
      </div>

      {showMembers && (
        <MemberListPanel
          server={server}
          currentUserId={user?._id}
          onPromote={handlePromote}
          onDemote={handleDemote}
          onKick={handleKick}
          onBan={handleBan}
          onMessage={handleMessageMember}
        />
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> milestone2-import
