// Trạng thái người dùng tự chọn (Có mặt / Đang chờ / Vắng mặt), độc lập với việc
// tài khoản có đang thực sự kết nối Socket.io hay không (xem SocketContext.jsx).
// Lưu ở User.status (server) và đồng bộ real-time qua sự kiện 'user_status_changed'.
export const STATUS_OPTIONS = [
  { value: 'online', label: 'Có mặt', dotClass: 'bg-cm-green' },
  { value: 'idle', label: 'Đang chờ', dotClass: 'bg-yellow-400' },
  { value: 'away', label: 'Vắng mặt', dotClass: 'bg-cm-muted' },
];

export const STATUS_META = {
  online: { label: 'Có mặt', dotClass: 'bg-cm-green' },
  idle: { label: 'Đang chờ', dotClass: 'bg-yellow-400' },
  away: { label: 'Vắng mặt', dotClass: 'bg-cm-muted' },
  offline: { label: 'Ngoại tuyến', dotClass: 'bg-cm-muted' },
};

// Trạng thái thủ công chỉ có ý nghĩa khi người dùng ĐANG thực sự kết nối
// (nằm trong onlineUsers qua socket). Ngắt kết nối -> luôn hiển thị "Ngoại tuyến",
// bất kể họ đã chọn trạng thái gì trước đó (giống Discord: đóng app thì tắt hẳn mọi
// trạng thái hiển thị, không để lại trạng thái "Có mặt" giả trên máy người khác).
export const getEffectiveStatus = (userId, storedStatus, onlineUsers) => {
  if (!userId || !onlineUsers?.has(userId)) return 'offline';
  return storedStatus && STATUS_META[storedStatus] ? storedStatus : 'online';
};
