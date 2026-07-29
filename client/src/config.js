// Địa chỉ backend dùng chung cho cả REST API, Socket.io và file đính kèm.
//
// - Nếu KHÔNG set VITE_API_URL: coi như backend chạy cùng máy với frontend
//   (dùng cho dev 1 máy) -> API dùng đường dẫn tương đối '/api' qua Vite proxy,
//   Socket.io tự suy ra host hiện tại.
// - Nếu CÓ set VITE_API_URL (vd: http://192.168.1.5:5000): mọi request REST,
//   Socket.io, và link file đính kèm sẽ trỏ thẳng về đúng 1 backend đó,
//   dù frontend đang chạy trên máy nào.
//
// Cách dùng khi test nhiều máy: chỉ 1 máy (vd máy A) chạy `npm run dev` đầy đủ
// (backend + frontend). Các máy còn lại tạo file client/.env.local với nội dung:
//   VITE_API_URL=http://<IP-máy-A>:5000
// rồi chạy `npm run client` (không cần tự chạy backend riêng nữa).

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Ghép 1 đường dẫn tương đối (vd '/uploads/abc.png') thành URL đầy đủ,
// dùng cho link file đính kèm để nó luôn trỏ đúng về backend, kể cả
// khi frontend và backend không cùng 1 máy.
export const resolveFileUrl = (path) => {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
};
