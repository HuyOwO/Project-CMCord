import { useState } from 'react';
import AttachmentPreview from '../common/AttachmentPreview';
import StudentSubmissionPanel from './StudentSubmissionPanel';
import GradingPanel from './GradingPanel';

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  return new Date(deadline).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const isPastDeadline = (deadline) => deadline && new Date() > new Date(deadline);

export default function AssignmentList({ assignments, canManage, onEdit, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  if (assignments.length === 0) {
    return (
      <p className="text-cm-muted text-sm text-center py-10">
        Chưa có bài tập nào. {canManage && 'Bấm "Giao bài tập" để bắt đầu.'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {assignments.map((a) => {
        const isOpen = expandedId === a._id;
        const late = isPastDeadline(a.deadline);
        return (
          <div key={a._id} className="bg-cm-input rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(isOpen ? null : a._id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className="text-lg flex-shrink-0">📝</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{a.title}</div>
                {a.deadline && (
                  <div className={`text-xs ${late ? 'text-red-400' : 'text-cm-muted'}`}>
                    Hạn nộp: {formatDeadline(a.deadline)}{late && ' (đã hết hạn)'}
                  </div>
                )}
              </div>
              <span className="text-cm-muted text-xs flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-cm-border/60 pt-3">
                {a.description && (
                  <p className="text-cm-text text-sm whitespace-pre-wrap leading-relaxed mb-2">{a.description}</p>
                )}
                {a.fileUrl && (
                  <AttachmentPreview
                    fileUrl={a.fileUrl}
                    fileName={a.fileName}
                    fileType={a.fileType}
                    className="mb-2"
                  />
                )}

                {canManage && (
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-cm-border/60">
                    <button onClick={() => onEdit(a)} className="text-cm-accent text-xs hover:underline">Sửa</button>
                    <button onClick={() => onDelete(a)} className="text-red-400 text-xs hover:underline">Xoá</button>
                  </div>
                )}

                {canManage ? (
                  <GradingPanel assignmentId={a._id} />
                ) : (
                  <StudentSubmissionPanel assignmentId={a._id} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
