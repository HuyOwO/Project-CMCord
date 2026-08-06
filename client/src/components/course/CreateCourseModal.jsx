import { useState } from 'react';
import Modal from '../common/Modal';
import { COURSE_TYPES } from '../../utils/coursePermissions';

// Modal tạo khoá học mới trong 1 server (chỉ owner/moderator server mới thấy nút này).
// Người tạo tự động trở thành instructor của khoá học (xử lý ở backend).
// Milestone 4: chọn kiểu khoá học (Đại cương / Chuyên ngành) ngay lúc tạo -- KHÔNG đổi
// được sau đó, vì 2 kiểu dùng 2 hệ chức năng khác nhau (Bài tập vs Nhiệm vụ).
export default function CreateCourseModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setName('');
    setDescription('');
    setType('general');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onCreate({ name: name.trim(), description: description.trim(), type });
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo khoá học thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-white font-bold text-lg mb-1">Tạo khoá học mới</h2>
      <p className="text-cm-muted text-xs mb-4">
        Bạn sẽ tự động là Instructor của khoá học này.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-cm-muted text-xs block mb-1">Tên khoá học</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Công nghệ phần mềm"
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>
        <div>
          <label className="text-cm-muted text-xs block mb-1">Kiểu khoá học</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          >
            {COURSE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <p className="text-cm-muted text-[11px] mt-1">
            {COURSE_TYPES.find((t) => t.value === type)?.hint} — không đổi được sau khi tạo.
          </p>
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
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={handleClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded"
          >
            {loading ? 'Đang tạo...' : 'Tạo khoá học'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
