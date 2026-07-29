import { useState } from 'react';
import Modal from '../common/Modal';

// Hiện mã mời riêng của khoá học (instructor/TA dùng để mời student enroll).
export default function CourseInviteModal({ isOpen, onClose, course }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!course?.inviteCode) return;
    await navigator.clipboard.writeText(course.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-white font-bold text-lg mb-1">Mời vào khoá học {course?.name}</h2>
      <p className="text-cm-muted text-xs mb-4">
        Gửi mã này cho sinh viên, họ dùng nút "Tham gia khoá học" để nhập mã và enroll.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-cm-input text-cm-text rounded px-3 py-2 text-sm font-mono truncate">
          {course?.inviteCode}
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
