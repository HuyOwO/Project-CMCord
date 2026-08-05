import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { resolveFileUrl } from '../../config';
import { MAX_FILE_SIZE, formatFileSize } from '../../utils/file';

// Cài đặt máy chủ: đổi ảnh/tên/mô tả + khu vực xoá server (chỉ mở cho owner từ phía component cha).
export default function ServerSettingsModal({ isOpen, onClose, server, onSave, onUploadAvatar, onDeleteServer }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(server?.name || '');
      setDescription(server?.description || '');
      setAvatarError('');
    }
  }, [isOpen, server]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError(`Ảnh "${file.name}" vượt quá ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }
    setAvatarError('');
    setAvatarUploading(true);
    try {
      await onUploadAvatar(file);
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const avatarUrl = server?.avatar ? resolveFileUrl(server.avatar) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-white font-bold text-lg mb-4">Cài đặt máy chủ</h2>

      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="relative w-16 h-16 rounded-full bg-cm-accent flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden group"
          title="Đổi ảnh server"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="server avatar" className="w-full h-full object-cover" />
          ) : (
            server?.name?.[0]?.toUpperCase()
          )}
          <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] transition-opacity">
            {avatarUploading ? '...' : 'Đổi ảnh'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          className="hidden"
        />
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{server?.name}</p>
          <p className="text-cm-muted text-xs">Chỉ chủ server mới đổi được ảnh này</p>
        </div>
      </div>
      {avatarError && <p className="text-red-400 text-xs mb-3">{avatarError}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-cm-muted text-xs block mb-1">Tên server</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>
        <div>
          <label className="text-cm-muted text-xs block mb-1">Mô tả (tuỳ chọn)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
            Hủy
          </button>
          <button type="submit" className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded">
            Lưu
          </button>
        </div>
      </form>

      <div className="mt-5 pt-4 border-t border-cm-border">
        <button
          onClick={onDeleteServer}
          className="w-full px-3 py-2 text-sm text-red-400 border border-red-900 rounded hover:bg-red-950"
        >
          Xoá server vĩnh viễn
        </button>
      </div>
    </Modal>
  );
}
