import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '../services';

// Route ngắn /courses/:courseId -- không cần biết trước serverId (vd khi click từ
// toast thông báo real-time). Tự tra course để lấy serverId rồi điều hướng tiếp
// sang URL đầy đủ /servers/:serverId/courses/:courseId.
export default function CourseRedirect() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    courseService.getOne(courseId)
      .then((course) => {
        const serverId = course.server?._id || course.server;
        navigate(`/servers/${serverId}/courses/${courseId}`, { replace: true });
      })
      .catch(() => setError('Không tìm thấy khoá học này hoặc bạn không có quyền truy cập.'));
  }, [courseId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-cm-muted text-sm">
      {error || 'Đang mở khoá học...'}
    </div>
  );
}
