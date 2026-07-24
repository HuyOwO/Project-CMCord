import { useState, useEffect } from 'react';
import { dmService } from '../../services';

// Modal chọn người để bắt đầu 1 cuộc trò chuyện riêng.
// Danh sách chỉ gồm người CHUNG ít nhất 1 server với mình (chưa có hệ thống
// bạn bè), khớp với điều kiện phía backend (dmController.shareServer).
export default function NewDMModal({ isOpen, onClose, onSelectUser }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setLoading(true);
    dmService.getContacts()
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = contacts.filter((c) =>
    c.username.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-cm-sidebar rounded-lg w-96 max-h-[70vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-3 border-b border-cm-border">
          <h2 className="text-white font-bold text-lg mb-3">Nhắn tin mới</h2>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên người dùng..."
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading && <p className="text-cm-muted text-sm text-center py-6">Đang tải...</p>}

          {!loading && contacts.length === 0 && (
            <p className="text-cm-muted text-sm text-center py-6">
              Bạn cần tham gia chung ít nhất 1 server với ai đó để nhắn tin trực tiếp.
            </p>
          )}

          {!loading && contacts.length > 0 && filtered.length === 0 && (
            <p className="text-cm-muted text-sm text-center py-6">Không tìm thấy ai khớp "{query}".</p>
          )}

          {filtered.map((c) => (
            <button
              key={c._id}
              onClick={() => onSelectUser(c._id)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded text-left hover:bg-cm-input"
            >
              <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.username[0].toUpperCase()}
              </div>
              <span className="text-cm-text text-sm truncate">{c.username}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
