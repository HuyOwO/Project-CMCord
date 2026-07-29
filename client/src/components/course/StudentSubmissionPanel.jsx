import { useState, useEffect, useRef } from 'react';
import { submissionService } from '../../services';
import { resolveFileUrl } from '../../config';
import { formatFileSize, MAX_FILE_SIZE } from '../../utils/file';

// Panel nộp bài dành cho student: hiện bài đã nộp (nếu có) + điểm/nhận xét nếu đã được chấm,
// và form để nộp lại (resubmit). Tự tải bài nộp của CHÍNH MÌNH khi mount (API tự lọc theo role).
export default function StudentSubmissionPanel({ assignmentId }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => {
    setLoading(true);
    submissionService.getAll(assignmentId)
      .then((list) => setSubmission(list[0] || null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [assignmentId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;
    setSubmitting(true);
    try {
      await submissionService.submit(assignmentId, content.trim(), file);
      setContent('');
      setFile(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-cm-muted text-xs py-2">Đang tải bài nộp...</p>;

  return (
    <div className="space-y-3">
      {submission && (
        <div className="bg-cm-bg rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-cm-muted text-xs">
              Đã nộp lúc {new Date(submission.submittedAt).toLocaleString('vi-VN')}
              {submission.isLate && <span className="text-yellow-400 ml-1">(trễ hạn)</span>}
            </span>
            {submission.grade?.score != null ? (
              <span className="text-cm-green text-sm font-semibold">{submission.grade.score}/10</span>
            ) : (
              <span className="text-cm-muted text-xs">Chưa chấm</span>
            )}
          </div>
          {submission.content && <p className="text-cm-text text-sm whitespace-pre-wrap mb-1">{submission.content}</p>}
          {submission.fileUrl && (
            <a href={resolveFileUrl(submission.fileUrl)} target="_blank" rel="noreferrer" className="text-cm-accent text-xs hover:underline">
              📎 {submission.fileName || 'File đã nộp'}
            </a>
          )}
          {submission.grade?.feedback && (
            <div className="mt-2 pt-2 border-t border-cm-border/60">
              <p className="text-cm-muted text-xs font-semibold mb-0.5">Nhận xét của giảng viên</p>
              <p className="text-cm-text text-sm whitespace-pre-wrap">{submission.grade.feedback}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <p className="text-cm-muted text-xs">{submission ? 'Nộp lại bài (sẽ thay thế bài cũ):' : 'Nộp bài:'}</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Nội dung bài làm (tuỳ chọn nếu có đính kèm file)..."
          className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-cm-accent"
        />
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 bg-cm-input hover:bg-cm-border rounded text-cm-text flex-shrink-0"
          >
            📎 Đính kèm file
          </button>
          {file && (
            <span className="text-xs text-cm-text truncate flex-1">
              {file.name} <span className="text-cm-muted">({formatFileSize(file.size)})</span>
            </span>
          )}
          <button
            type="submit"
            disabled={submitting || (!content.trim() && !file)}
            className="ml-auto px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded flex-shrink-0"
          >
            {submitting ? 'Đang nộp...' : submission ? 'Nộp lại' : 'Nộp bài'}
          </button>
        </div>
        {fileError && <p className="text-red-400 text-xs">{fileError}</p>}
      </form>
    </div>
  );
}
