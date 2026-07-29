import { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { formatFileSize, MAX_FILE_SIZE } from '../../utils/file';

// Chuyển Date -> chuỗi cho input[type=datetime-local] (giờ địa phương, không có giây/Z)
const toDatetimeLocal = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Modal tạo bài tập mới HOẶC sửa bài tập có sẵn (truyền prop `assignment` để chuyển sang chế độ sửa).
export default function AssignmentModal({ isOpen, onClose, onSave, assignment = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const isEdit = !!assignment;

  useEffect(() => {
    if (isOpen) {
      setTitle(assignment?.title || '');
      setDescription(assignment?.description || '');
      setDeadline(toDatetimeLocal(assignment?.deadline));
      setFile(null);
      setFileError('');
    }
  }, [isOpen, assignment]);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      setFileError(`File "${f.name}" vượt quá 8MB.`);
      return;
    }
    setFileError('');
    setFile(f);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setFile(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({ title: title.trim(), description, deadline: deadline || null }, file);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-white font-bold text-lg mb-4">
        {isEdit ? 'Sửa bài tập' : 'Giao bài tập mới'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-cm-muted text-xs block mb-1">Tiêu đề</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Bài tập lớn - Chương 1"
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>
        <div>
          <label className="text-cm-muted text-xs block mb-1">Mô tả / yêu cầu</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>
        <div>
          <label className="text-cm-muted text-xs block mb-1">Deadline (tuỳ chọn)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="text-cm-muted text-xs block mb-1">File đính kèm (tuỳ chọn, tối đa 8MB)</label>
            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 bg-cm-input hover:bg-cm-border rounded text-cm-text"
            >
              📎 Chọn file
            </button>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-xs text-cm-text">
                <span className="truncate flex-1">{file.name}</span>
                <span className="text-cm-muted flex-shrink-0">{formatFileSize(file.size)}</span>
                <button type="button" onClick={() => setFile(null)} className="text-cm-muted hover:text-white">✕</button>
              </div>
            )}
            {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={handleClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
