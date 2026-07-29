import { useState } from 'react';
import Modal from '../common/Modal';

// Nhập mã mời riêng của khoá học (khác với mã mời của server) để enroll với vai trò student.
export default function JoinCourseModal({ isOpen, onClose, onJoin }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onJoin(code.trim());
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Mã mời không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-white font-bold text-lg mb-1">Tham gia khoá học</h2>
      <p className="text-cm-muted text-xs mb-4">Nhập mã mời của khoá học để enroll với vai trò Student.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Nhập mã mời khoá học..."
          className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={handleClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded"
          >
            {loading ? 'Đang tham gia...' : 'Tham gia'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
