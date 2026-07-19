import { useState } from 'react';
import Modal from '../common/Modal';

// Hiện mã mời của server hiện tại + nút copy vào clipboard.
export default function InviteModal({ isOpen, onClose, server }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!server?.inviteCode) return;
    await navigator.clipboard.writeText(server.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-white font-bold text-lg mb-1">Mời mọi người vào {server?.name}</h2>
      <p className="text-cm-muted text-xs mb-4">
        Gửi mã này cho bạn bè, họ dùng nút "Tham gia server" để nhập mã và vào server.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-cm-input text-cm-text rounded px-3 py-2 text-sm font-mono truncate">
          {server?.inviteCode}
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded flex-shrink-0"
        >
          {copied ? 'Đã copy!' : 'Copy'}
        </button>
      </div>
    </Modal>
  );
}
