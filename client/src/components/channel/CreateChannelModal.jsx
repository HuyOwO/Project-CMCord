import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

// Modal tạo channel mới HOẶC đổi tên channel có sẵn (truyền prop `channel` để chuyển sang chế độ đổi tên).
// Chỉ lo phần UI + validate rỗng; việc gọi API và cập nhật state do component cha xử lý qua onCreate.
export default function CreateChannelModal({ isOpen, onClose, onCreate, channel = null }) {
  const [name, setName] = useState(channel?.name || '');
  const isRename = !!channel;

  // Mỗi lần mở modal, nạp lại tên hiện tại của channel (nếu đang đổi tên)
  useEffect(() => {
    if (isOpen) setName(channel?.name || '');
  }, [isOpen, channel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-white font-bold text-lg mb-1">
        {isRename ? 'Đổi tên Channel' : 'Tạo Channel mới'}
      </h2>
      <p className="text-cm-muted text-xs mb-4">
        Tên sẽ tự động viết thường và thay khoảng trắng bằng dấu gạch ngang.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center bg-cm-input rounded px-3">
          <span className="text-cm-muted mr-1">#</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="tên-channel-mới"
            className="w-full bg-transparent text-cm-text py-2 text-sm outline-none"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 text-cm-muted hover:text-white text-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded"
          >
            {isRename ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </Modal>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> milestone2-import
