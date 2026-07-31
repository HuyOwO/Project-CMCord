import { useState, useEffect } from 'react';
import { submissionService } from '../../services';
import AttachmentPreview from '../common/AttachmentPreview';

// Panel chấm điểm dành cho instructor/TA: liệt kê TẤT CẢ bài nộp của assignment này,
// mỗi hàng có thể mở ra để xem nội dung + chấm điểm/nhận xét.
export default function GradingPanel({ assignmentId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    submissionService.getAll(assignmentId)
      .then(setSubmissions)
      .finally(() => setLoading(false));
  };

  useEffect(load, [assignmentId]);

  if (loading) return <p className="text-cm-muted text-xs py-2">Đang tải danh sách bài nộp...</p>;

  if (submissions.length === 0) {
    return <p className="text-cm-muted text-sm py-3">Chưa có sinh viên nào nộp bài.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-cm-muted text-xs mb-1">{submissions.length} bài nộp</p>
      {submissions.map((s) => (
        <SubmissionRow
          key={s._id}
          submission={s}
          isOpen={openId === s._id}
          onToggle={() => setOpenId(openId === s._id ? null : s._id)}
          onGraded={load}
        />
      ))}
    </div>
  );
}

function SubmissionRow({ submission, isOpen, onToggle, onGraded }) {
  const [score, setScore] = useState(submission.grade?.score ?? '');
  const [feedback, setFeedback] = useState(submission.grade?.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGrade = async (e) => {
    e.preventDefault();
    const num = Number(score);
    if (Number.isNaN(num) || num < 0 || num > 10) {
      setError('Điểm phải từ 0 đến 10');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await submissionService.grade(submission._id, { score: num, feedback });
      onGraded();
    } catch (err) {
      setError(err.response?.data?.message || 'Lưu điểm thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-cm-bg rounded">
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-3 py-2 text-left">
        <div className="w-6 h-6 rounded-full bg-cm-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {submission.student?.username?.[0]?.toUpperCase()}
        </div>
        <span className="text-cm-text text-sm flex-1 truncate">{submission.student?.username}</span>
        {submission.isLate && <span className="text-yellow-400 text-xs flex-shrink-0">Trễ hạn</span>}
        {submission.grade?.score != null ? (
          <span className="text-cm-green text-xs font-semibold flex-shrink-0">{submission.grade.score}/10</span>
        ) : (
          <span className="text-cm-muted text-xs flex-shrink-0">Chưa chấm</span>
        )}
        <span className="text-cm-muted text-xs flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 border-t border-cm-border/60 pt-2">
          <p className="text-cm-muted text-xs mb-1">
            Nộp lúc {new Date(submission.submittedAt).toLocaleString('vi-VN')}
          </p>
          {submission.content && <p className="text-cm-text text-sm whitespace-pre-wrap mb-1">{submission.content}</p>}
          {submission.fileUrl && (
            <AttachmentPreview
              fileUrl={submission.fileUrl}
              fileName={submission.fileName}
              fileType={submission.fileType}
              className="mb-2"
            />
          )}

          <form onSubmit={handleGrade} className="space-y-2 mt-2 pt-2 border-t border-cm-border/60">
            <div className="flex items-center gap-2">
              <label className="text-cm-muted text-xs flex-shrink-0">Điểm (0-10):</label>
              <input
                type="number" min="0" max="10" step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-20 bg-cm-input text-cm-text rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
              />
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={2}
              placeholder="Nhận xét cho sinh viên..."
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-cm-accent"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={saving || score === ''}
              className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded"
            >
              {saving ? 'Đang lưu...' : 'Lưu điểm'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
