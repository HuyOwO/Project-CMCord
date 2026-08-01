import { useState } from 'react';
import { useUserStatuses } from '../../hooks/useSocket';
import { getEffectiveStatus } from '../../utils/status';
import StatusDot from '../common/StatusDot';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Đang chờ' },
  { key: 'add', label: 'Thêm bạn bè' },
];

// Panel quản lý bạn bè: danh sách bạn, lời mời đến/đi, và form thêm bạn theo username.
// Hiển thị làm nội dung chính của DMPage khi vào route /friends (thay cho khung chat).
//
// Milestone 3: chấm trạng thái dùng StatusDot (Có mặt/Đang chờ/Vắng mặt/Ngoại tuyến)
// thay vì chỉ chấm xanh online/offline như trước.
export default function FriendsPanel({
  friends,
  incomingRequests,
  outgoingRequests,
  onAccept,
  onRemove,
  onSendRequest,
  onMessageUser,
  onlineUsers,
}) {
  const userStatuses = useUserStatuses();
  const [tab, setTab] = useState('all');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [sending, setSending] = useState(false);

  const pendingCount = incomingRequests.length;

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    setSending(true);
    setStatus(null);
    try {
      await onSendRequest(name);
      setStatus({ type: 'success', message: `Đã gửi lời mời kết bạn tới ${name}.` });
      setUsername('');
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.message || 'Gửi lời mời thất bại.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-cm-surface">
      <div className="px-4 py-3 border-b border-cm-border flex items-center gap-1 flex-wrap">
        <span className="text-white font-semibold mr-3">👥 Bạn bè</span>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-3 py-1.5 rounded relative ${
              tab === t.key ? 'bg-cm-input text-white' : 'text-cm-muted hover:text-white hover:bg-cm-input'
            }`}
          >
            {t.label}
            {t.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full w-4 h-4">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'all' && (
          <>
            <p className="text-cm-muted text-xs font-semibold uppercase tracking-wide mb-2">
              Tất cả bạn bè — {friends.length}
            </p>
            {friends.length === 0 && (
              <p className="text-cm-muted text-sm py-6 text-center">
                Chưa có ai trong danh sách bạn bè. Sang tab "Thêm bạn bè" để bắt đầu kết bạn.
              </p>
            )}
            {friends.map((f) => {
              const effectiveStatus = getEffectiveStatus(
                f.user._id,
                userStatuses.get(f.user._id) ?? f.user.status,
                onlineUsers
              );
              return (
                <div key={f._id} className="flex items-center gap-3 px-2 py-2.5 rounded hover:bg-cm-input group">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-cm-accent flex items-center justify-center text-white text-sm font-bold">
                      {f.user.username[0].toUpperCase()}
                    </div>
                    <StatusDot status={effectiveStatus} borderClass="border-cm-surface" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm truncate">{f.user.username}</div>
                    <div className="text-cm-muted text-xs">{STATUS_LABEL(effectiveStatus)}</div>
                  </div>
                  <button
                    onClick={() => onMessageUser(f.user._id)}
                    title="Nhắn tin"
                    className="opacity-0 group-hover:opacity-100 text-cm-muted hover:text-cm-accent text-sm px-2 flex-shrink-0"
                  >
                    💬
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`Huỷ kết bạn với ${f.user.username}?`)) onRemove(f._id); }}
                    title="Huỷ kết bạn"
                    className="opacity-0 group-hover:opacity-100 text-cm-muted hover:text-red-400 text-sm px-2 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </>
        )}

        {tab === 'pending' && (
          <>
            <p className="text-cm-muted text-xs font-semibold uppercase tracking-wide mb-2">
              Lời mời đến — {incomingRequests.length}
            </p>
            {incomingRequests.length === 0 && (
              <p className="text-cm-muted text-sm pb-4">Không có lời mời nào đang chờ.</p>
            )}
            {incomingRequests.map((r) => (
              <div key={r._id} className="flex items-center gap-3 px-2 py-2.5 rounded hover:bg-cm-input">
                <div className="w-9 h-9 rounded-full bg-cm-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.user.username[0].toUpperCase()}
                </div>
                <span className="text-white text-sm flex-1 truncate">{r.user.username}</span>
                <button onClick={() => onAccept(r._id)} className="text-cm-green text-xs hover:underline flex-shrink-0">
                  Chấp nhận
                </button>
                <button onClick={() => onRemove(r._id)} className="text-cm-muted hover:text-red-400 text-xs flex-shrink-0">
                  Từ chối
                </button>
              </div>
            ))}

            <p className="text-cm-muted text-xs font-semibold uppercase tracking-wide mt-5 mb-2">
              Lời mời đã gửi — {outgoingRequests.length}
            </p>
            {outgoingRequests.length === 0 && (
              <p className="text-cm-muted text-sm">Bạn chưa gửi lời mời nào.</p>
            )}
            {outgoingRequests.map((r) => (
              <div key={r._id} className="flex items-center gap-3 px-2 py-2.5 rounded hover:bg-cm-input">
                <div className="w-9 h-9 rounded-full bg-cm-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {r.user.username[0].toUpperCase()}
                </div>
                <span className="text-white text-sm flex-1 truncate">{r.user.username}</span>
                <span className="text-cm-muted text-xs flex-shrink-0">Đang chờ...</span>
                <button onClick={() => onRemove(r._id)} className="text-cm-muted hover:text-red-400 text-xs flex-shrink-0">
                  Huỷ
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'add' && (
          <div className="max-w-md">
            <p className="text-cm-text text-sm mb-3">
              Thêm bạn bằng username chính xác (phân biệt hoa/thường).
            </p>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username..."
                className="flex-1 bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
              />
              <button
                type="submit"
                disabled={sending || !username.trim()}
                className="px-4 py-2 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded flex-shrink-0"
              >
                Gửi lời mời
              </button>
            </form>
            {status && (
              <p className={`text-xs mt-2 ${status.type === 'success' ? 'text-cm-green' : 'text-red-400'}`}>
                {status.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_LABEL = (status) => {
  const labels = { online: 'Có mặt', idle: 'Đang chờ', away: 'Vắng mặt', offline: 'Offline' };
  return labels[status] || 'Offline';
};
