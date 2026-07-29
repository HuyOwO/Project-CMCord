import { useState } from 'react';
import { resolveFileUrl } from '../../config';

// Danh sách bài học theo thứ tự (order). Instructor/TA có thêm nút sửa/xoá/di chuyển lên-xuống.
// Dùng nút lên/xuống thay vì kéo-thả để đơn giản và chắc chắn hoạt động trên mọi thiết bị.
export default function LessonList({ lessons, canManage, onEdit, onDelete, onMove }) {
  const [expandedId, setExpandedId] = useState(null);

  if (lessons.length === 0) {
    return (
      <p className="text-cm-muted text-sm text-center py-10">
        Chưa có bài học nào. {canManage && 'Bấm "Thêm bài học" để bắt đầu.'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson, i) => {
        const isOpen = expandedId === lesson._id;
        return (
          <div key={lesson._id} className="bg-cm-input rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(isOpen ? null : lesson._id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className="text-cm-muted text-xs font-mono flex-shrink-0">#{i + 1}</span>
              <span className="text-white text-sm font-medium flex-1 truncate">{lesson.title}</span>
              <span className="text-cm-muted text-xs flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-cm-border/60 pt-3">
                {lesson.content && (
                  <p className="text-cm-text text-sm whitespace-pre-wrap leading-relaxed mb-2">
                    {lesson.content}
                  </p>
                )}
                {lesson.fileUrl && (
                  <a
                    href={resolveFileUrl(lesson.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cm-accent text-xs hover:underline inline-block mb-2"
                  >
                    📎 {lesson.fileName || 'Tải tài liệu'}
                  </a>
                )}

                {canManage && (
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-cm-border/60">
                    <button
                      onClick={() => onMove(lesson, -1)}
                      disabled={i === 0}
                      className="text-cm-muted hover:text-white text-xs disabled:opacity-30"
                    >
                      ↑ Lên
                    </button>
                    <button
                      onClick={() => onMove(lesson, 1)}
                      disabled={i === lessons.length - 1}
                      className="text-cm-muted hover:text-white text-xs disabled:opacity-30"
                    >
                      ↓ Xuống
                    </button>
                    <button onClick={() => onEdit(lesson)} className="text-cm-accent text-xs hover:underline">
                      Sửa
                    </button>
                    <button onClick={() => onDelete(lesson)} className="text-red-400 text-xs hover:underline">
                      Xoá
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
