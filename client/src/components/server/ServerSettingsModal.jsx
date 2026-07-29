import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

// Cài đặt máy chủ: đổi tên/mô tả + khu vực xoá server (chỉ mở cho owner từ phía component cha).
export default function ServerSettingsModal({ isOpen, onClose, server, onSave, onDeleteServer }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(server?.name || '');
      setDescription(server?.description || '');
    }
  }, [isOpen, server]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-white font-bold text-lg mb-4">Cài đặt máy chủ</h2>
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
