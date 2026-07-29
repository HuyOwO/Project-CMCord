import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverService, channelService } from '../services';
import useAuth from '../hooks/useAuth';
import useServerSelect from '../hooks/useServerSelect';
import ServerSidebar from '../components/server/ServerSidebar';
import ChannelSidebar from '../components/channel/ChannelSidebar';
import CreateChannelModal from '../components/channel/CreateChannelModal';
import InviteModal from '../components/server/InviteModal';
import JoinServerModal from '../components/server/JoinServerModal';
import ServerSettingsModal from '../components/server/ServerSettingsModal';
import NicknameModal from '../components/server/NicknameModal';
import Modal from '../components/common/Modal';
import { getRole, getDisplayName } from '../utils/permissions';

export default function HomePage() {
  const { user, logout }    = useAuth();
  const navigate             = useNavigate();
  const goToServer           = useServerSelect();
  const [servers, setServers]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [channels, setChannels]   = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin]     = useState(false);
  const [renamingChannel, setRenamingChannel] = useState(null);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showNickname, setShowNickname] = useState(false);

  useEffect(() => {
    serverService.getAll().then(setServers);
  }, []);

  // Chọn 1 server: highlight icon + nhảy vào channel đầu tiên (logic nhảy nằm trong useServerSelect)
  const handleSelectServer = (srv) => {
    setSelected(srv);
    goToServer(srv);
  };

  const createServer = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const srv = await serverService.create(newName.trim());
    setServers(prev => [...prev, srv]);
    setNewName('');
    setShowCreate(false);
    handleSelectServer(srv);
  };

  const canCreateChannel = getRole(selected, user?._id) === 'owner';

  const createChannel = async (name) => {
    const ch = await channelService.create(selected._id, name);
    setChannels(prev => [...prev, ch]);
    setShowCreateChannel(false);
    navigate(`/channels/${selected._id}/${ch._id}`);
  };

  const handleRenameChannel = async (name) => {
    const updated = await channelService.update(selected._id, renamingChannel._id, name);
    setChannels(prev => prev.map(c => c._id === updated._id ? updated : c));
    setRenamingChannel(null);
  };

  const handleDeleteChannel = async (channel) => {
    if (!window.confirm(`Xoá channel #${channel.name}? Toàn bộ tin nhắn trong đó cũng sẽ mất.`)) return;
    await channelService.remove(selected._id, channel._id);
    setChannels(prev => prev.filter(c => c._id !== channel._id));
  };

  // Tham gia 1 server khác bằng mã mời -> nhảy vào channel đầu tiên của server đó
  const handleJoinServer = async (inviteCode) => {
    const srv = await serverService.join(inviteCode);
    setServers(prev => [...prev, srv]);
    const chs = await channelService.getAll(srv._id);
    setShowJoin(false);
    if (chs.length > 0) navigate(`/channels/${srv._id}/${chs[0]._id}`);
  };

  const handleUpdateServer = async ({ name, description }) => {
    const updated = await serverService.update(selected._id, { name, description });
    setSelected(updated);
    setServers(prev => prev.map(s => s._id === updated._id ? updated : s));
    setShowServerSettings(false);
  };

  const handleDeleteServer = async () => {
    if (!window.confirm(`Xoá vĩnh viễn server "${selected?.name}"? Hành động này KHÔNG thể hoàn tác.`)) return;
    await serverService.remove(selected._id);
    setServers(prev => prev.filter(s => s._id !== selected._id));
    setSelected(null);
    setChannels([]);
  };

  const handleUpdateNickname = async (nickname) => {
    const updated = await serverService.updateNickname(selected._id, nickname);
    setSelected(updated);
    setShowNickname(false);
  };

  const handleLeaveServer = async () => {
    if (!window.confirm(`Rời khỏi server "${selected?.name}"?`)) return;
    await serverService.leave(selected._id);
    setServers(prev => prev.filter(s => s._id !== selected._id));
    setSelected(null);
    setChannels([]);
  };

  const myNickname = selected?.members?.find(m => (m.user?._id || m.user) === user?._id)?.nickname || '';
  const myDisplayName = getDisplayName(selected, user?._id, user?.username);

  return (
    <div className="flex h-screen bg-cm-bg overflow-hidden">
      <ServerSidebar
        servers={servers}
        activeServerId={selected?._id}
        onSelectServer={handleSelectServer}
        onCreateClick={() => setShowCreate(true)}
        onJoinClick={() => setShowJoin(true)}
        onHomeClick={() => navigate('/dm')}
      />

      <ChannelSidebar
        server={selected}
        channels={channels}
        activeChannelId={null}
        onSelectChannel={(ch) => navigate(`/channels/${selected._id}/${ch._id}`)}
        user={user}
        onLogout={logout}
        canCreateChannel={canCreateChannel}
        onCreateChannelClick={() => setShowCreateChannel(true)}
        onInviteClick={() => setShowInvite(true)}
        onRenameChannelClick={(ch) => setRenamingChannel(ch)}
        onDeleteChannelClick={handleDeleteChannel}
        isOwner={canCreateChannel}
        onSettingsClick={() => setShowServerSettings(true)}
        onNicknameClick={() => setShowNickname(true)}
        onLeaveClick={handleLeaveServer}
        displayName={myDisplayName}
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
        server={selected}
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
        server={selected}
      />

      <JoinServerModal
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        onJoin={handleJoinServer}
      />

      {/* Main content */}
      <div className="flex-1 bg-cm-surface flex items-center justify-center text-cm-muted">
        Chọn một channel để bắt đầu chat
      </div>

      {/* Modal tạo server */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-white font-bold text-lg mb-4">Tạo Server mới</h2>
        <form onSubmit={createServer} className="space-y-3">
          <input
            autoFocus value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Tên server..."
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
              Hủy
            </button>
            <button type="submit" className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded">
              Tạo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
