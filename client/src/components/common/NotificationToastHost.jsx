import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';

let nextId = 1;

// Toast thông báo real-time hiển thị TOÀN CỤC (mount 1 lần ở App.jsx, phía trên Routes),
// nên hoạt động bất kể người dùng đang ở trang nào — không phải chỉ khi đang mở đúng course đó.
// Lắng nghe 2 sự kiện Milestone 2: 'grade_posted' (có điểm mới) và 'deadline_reminder'
// (bài tập sắp đến hạn), cả 2 đều được server bắn qua đúng phòng riêng `user:<id>`.
export default function NotificationToastHost() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const pushToast = (toast) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, ...toast }]);
    timers.current[id] = setTimeout(() => dismiss(id), 8000);
  };

  const dismiss = (id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!socket) return;

    const handleGrade = (data) => {
      pushToast({
        icon: '📩',
        title: `Có điểm mới: ${data.assignmentTitle}`,
        subtitle: `${data.courseName ? data.courseName + ' — ' : ''}${data.score}/10`,
        courseId: data.courseId,
      });
    };

    const handleDeadline = (data) => {
      pushToast({
        icon: '⏰',
        title: `Sắp đến hạn: ${data.assignmentTitle}`,
        subtitle: `${data.courseName ? data.courseName + ' — ' : ''}Hạn nộp ${new Date(data.deadline).toLocaleString('vi-VN')}`,
        courseId: data.courseId,
      });
    };

    socket.on('grade_posted', handleGrade);
    socket.on('deadline_reminder', handleDeadline);
    return () => {
      socket.off('grade_posted', handleGrade);
      socket.off('deadline_reminder', handleDeadline);
    };
  }, [socket]);

  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => { navigate(`/courses/${t.courseId}`); dismiss(t.id); }}
          className="bg-cm-sidebar border border-cm-border shadow-xl rounded-lg px-4 py-3 flex items-start gap-2.5 cursor-pointer hover:bg-cm-input"
        >
          <span className="text-lg flex-shrink-0">{t.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{t.title}</p>
            <p className="text-cm-muted text-xs truncate">{t.subtitle}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismiss(t.id); }}
            className="text-cm-muted hover:text-white text-xs flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
