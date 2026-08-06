import AttachmentPreview from '../common/AttachmentPreview';
import { resolveFileUrl } from '../../config';
import { TASK_STATUS_META, TASK_STATUS_ORDER } from '../../utils/coursePermissions';

const formatDeadline = (deadline) => {
  if (!deadline) return null;
  return new Date(deadline).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const isPastDeadline = (deadline) => deadline && new Date() > new Date(deadline);

// Bảng theo dõi tiến trình Nhiệm vụ (Milestone 4, thay cho Bài tập ở course chuyên ngành),
// giống board issue kiểu GitHub: 3 cột theo trạng thái, mỗi thẻ 1 nhiệm vụ đã/chưa phân công.
export default function TaskBoard({ tasks, canManage, currentUserId, onCreateClick, onEdit, onDelete, onChangeStatus }) {
  const columns = TASK_STATUS_ORDER.map((status) => ({
    status,
    meta: TASK_STATUS_META[status],
    items: tasks.filter((t) => t.status === status),
  }));

  return (
    <div>
      {canManage && (
        <button
          onClick={onCreateClick}
          className="mb-4 px-4 py-2 bg-cm-accent hover:bg-indigo-500 text-white text-sm rounded"
        >
          + Tạo nhiệm vụ
        </button>
      )}

      {tasks.length === 0 ? (
        <p className="text-cm-muted text-sm text-center py-10">
          Chưa có nhiệm vụ nào. {canManage && 'Bấm "Tạo nhiệm vụ" để bắt đầu.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.status} className="bg-cm-bg/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2.5 h-2.5 rounded-full ${col.meta.dotClass}`} />
                <span className="text-white text-sm font-semibold">{col.meta.label}</span>
                <span className="text-cm-muted text-xs ml-auto">{col.items.length}</span>
              </div>

              <div className="space-y-2">
                {col.items.length === 0 && (
                  <p className="text-cm-muted text-xs text-center py-4">Không có nhiệm vụ</p>
                )}
                {col.items.map((t) => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    canManage={canManage}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChangeStatus={onChangeStatus}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, canManage, currentUserId, onEdit, onDelete, onChangeStatus }) {
  const isAssignee = task.assignee?._id === currentUserId;
  const canTouchStatus = canManage || isAssignee;
  const late = isPastDeadline(task.deadline) && task.status !== 'done';

  return (
    <div className="bg-cm-input rounded-lg p-3">
      <p className="text-white text-sm font-medium leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-cm-muted text-xs mt-1 line-clamp-3 whitespace-pre-wrap">{task.description}</p>
      )}

      {task.fileUrl && (
        <AttachmentPreview
          fileUrl={task.fileUrl}
          fileName={task.fileName}
          fileType={task.fileType}
          className="mt-2"
        />
      )}

      {task.deadline && (
        <div className={`text-[11px] mt-2 ${late ? 'text-red-400' : 'text-cm-muted'}`}>
          Hạn: {formatDeadline(task.deadline)}{late && ' (quá hạn)'}
        </div>
      )}

      <div className="flex items-center gap-1.5 mt-2.5">
        <div className="w-5 h-5 rounded-full bg-cm-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">
          {task.assignee?.avatar ? (
            <img src={resolveFileUrl(task.assignee.avatar)} alt="" className="w-full h-full object-cover" />
          ) : task.assignee ? (
            task.assignee.username[0].toUpperCase()
          ) : (
            '?'
          )}
        </div>
        <span className="text-cm-text text-xs truncate">
          {task.assignee?.username || 'Chưa phân công'}
        </span>
      </div>

      {(canManage || canTouchStatus) && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2.5 pt-2 border-t border-cm-border/60">
          {canTouchStatus && task.status === 'in_progress' && (
            <button onClick={() => onChangeStatus(task, 'done')} className="text-cm-green text-xs hover:underline">
              ✓ Đánh dấu xong
            </button>
          )}
          {canTouchStatus && task.status === 'done' && (
            <button onClick={() => onChangeStatus(task, 'in_progress')} className="text-yellow-400 text-xs hover:underline">
              ↺ Mở lại
            </button>
          )}
          {canManage && (
            <>
              <button onClick={() => onEdit(task)} className="text-cm-accent text-xs hover:underline">
                {task.status === 'unassigned' ? 'Phân công' : 'Sửa'}
              </button>
              <button onClick={() => onDelete(task)} className="text-red-400 text-xs hover:underline">
                Xoá
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
