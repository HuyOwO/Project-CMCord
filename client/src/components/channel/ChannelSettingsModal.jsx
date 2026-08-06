import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const ROLE_LABEL = { moderator: 'Moderator', member: 'Thành viên' };

// Cài đặt kênh: giới hạn quyền Xem / Nhắn tin theo role SERVER (moderator/member) cho riêng
// channel này. Chủ sở hữu (owner) luôn toàn quyền và không hiện trong bảng vì không thể bị giới hạn.
// Role không được bật "Xem" thì ô "Nhắn tin" tự động tắt theo và bị khoá — không thể nhắn tin
// ở kênh mà mình không được xem (khớp với logic resolveChannelPermission ở backend/client).
export default function ChannelSettingsModal({ isOpen, onClose, channel, onSave }) {
  const [perms, setPerms] = useState({
    moderator: { canView: true, canSend: true },
    member: { canView: true, canSend: true },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const next = {
      moderator: { canView: true, canSend: true },
      member: { canView: true, canSend: true },
    };
    (channel?.permissionOverrides || []).forEach((o) => {
      if (next[o.role]) next[o.role] = { canView: !!o.canView, canSend: !!o.canSend };
    });
    setPerms(next);
  }, [isOpen, channel]);

  if (!channel) return null;

  const toggleView = (role) => {
    setPerms((prev) => {
      const canView = !prev[role].canView;
      // Tắt "Xem" thì "Nhắn tin" cũng tắt theo, vì không thể nhắn ở kênh không xem được.
      return { ...prev, [role]: { canView, canSend: canView && prev[role].canSend } };
    });
  };

  const toggleSend = (role) => {
    setPerms((prev) => ({ ...prev, [role]: { ...prev[role], canSend: !prev[role].canSend } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const overrides = Object.entries(perms).map(([role, p]) => ({ role, ...p }));
      await onSave(overrides);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClass="w-96">
      <h2 className="text-white font-bold text-lg mb-1">Cài đặt kênh #{channel.name}</h2>
      <p className="text-cm-muted text-xs mb-4">
        Giới hạn quyền xem / nhắn tin theo role. Chủ sở hữu luôn toàn quyền ở mọi kênh.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {Object.keys(ROLE_LABEL).map((role) => (
            <div key={role} className="bg-cm-input rounded-lg px-3 py-2.5">
              <div className="text-cm-text text-sm font-medium mb-2">{ROLE_LABEL[role]}</div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-xs text-cm-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms[role].canView}
                    onChange={() => toggleView(role)}
                    className="accent-cm-accent"
                  />
                  Xem kênh
                </label>
                <label
                  className={`flex items-center gap-2 text-xs cursor-pointer ${
                    perms[role].canView ? 'text-cm-muted' : 'text-cm-muted/40 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={perms[role].canSend}
                    disabled={!perms[role].canView}
                    onChange={() => toggleSend(role)}
                    className="accent-cm-accent"
                  />
                  Nhắn tin
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-60 text-white text-sm rounded"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
