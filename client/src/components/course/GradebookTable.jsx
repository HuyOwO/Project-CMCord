import { useEffect, useState } from 'react';
import { courseService } from '../../services';

// Bảng điểm tổng hợp: mỗi hàng 1 sinh viên, mỗi cột 1 assignment, cột cuối là điểm trung bình.
// Chỉ instructor/TA gọi được (được chặn phía backend, ở đây chỉ cần hiển thị).
export default function GradebookTable({ courseId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    courseService.getGradebook(courseId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <p className="text-cm-muted text-sm py-4">Đang tải bảng điểm...</p>;
  if (!data) return null;

  const { assignments, rows } = data;

  if (assignments.length === 0) {
    return <p className="text-cm-muted text-sm text-center py-10">Chưa có bài tập nào để tổng hợp điểm.</p>;
  }
  if (rows.length === 0) {
    return <p className="text-cm-muted text-sm text-center py-10">Chưa có sinh viên nào trong khoá học.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-cm-muted text-xs uppercase tracking-wide">
            <th className="px-3 py-2 sticky left-0 bg-cm-surface">Sinh viên</th>
            {assignments.map((a) => (
              <th key={a._id} className="px-3 py-2 whitespace-nowrap">{a.title}</th>
            ))}
            <th className="px-3 py-2 whitespace-nowrap">Trung bình</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.student._id} className="border-t border-cm-border/60">
              <td className="px-3 py-2 sticky left-0 bg-cm-surface text-cm-text font-medium whitespace-nowrap">
                {row.student.username}
              </td>
              {row.scores.map((score, i) => (
                <td key={assignments[i]._id} className="px-3 py-2 text-cm-text">
                  {score != null ? score : <span className="text-cm-muted">—</span>}
                </td>
              ))}
              <td className="px-3 py-2 font-semibold">
                {row.average != null ? (
                  <span className="text-cm-green">{row.average.toFixed(1)}</span>
                ) : (
                  <span className="text-cm-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
