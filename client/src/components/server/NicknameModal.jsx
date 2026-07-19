import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

// Đổi biệt danh CỦA CHÍNH MÌNH trong server này. Không đụng tới username toàn cục.
export default function NicknameModal({ isOpen, onClose, currentNickname, onSave }) {
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (isOpen) setNickname(currentNickname || '');
  }, [isOpen, currentNickname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(nickname.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-white font-bold text-lg mb-1">Đổi biệt danh</h2>
      <p className="text-cm-muted text-xs mb-4">
        Biệt danh trong server hiện tại. Để trống nếu muốn sử dụng username gốc.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          autoFocus
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Biệt danh của bạn..."
          maxLength={32}
          className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
            Hủy
          </button>
          <button type="submit" className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded">
            Lưu
          </button>
        </div>
      </form>
    </Modal>
  );
}