import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';
import { API_BASE_URL } from '../config';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  // Milestone 3: trạng thái thủ công (Có mặt/Đang chờ/Vắng mặt) của từng user, cập nhật
  // real-time qua sự kiện 'user_status_changed' (bắn từ userController.js khi ai đó đổi
  // trạng thái trong ProfileModal). Không cần tải sẵn toàn bộ map này lúc kết nối vì mỗi nơi
  // hiển thị (member list, friend list, DM list...) đã có sẵn field `status` kèm theo trong
  // dữ liệu populate ban đầu từ server -- map này chỉ dùng để cập nhật LIVE sau đó.
  const [userStatuses, setUserStatuses] = useState(new Map());

  // Kết nối lại socket mỗi khi trạng thái đăng nhập (user) thay đổi,
  // thay vì chỉ 1 lần lúc app khởi động (trước đây nếu chưa login lúc mount
  // thì socket sẽ mãi là null cho tới khi F5 lại trang).
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setSocket(null);
      return;
    }

    // Ưu tiên VITE_API_URL nếu có set (trỏ đích danh về 1 backend cụ thể,
    // dùng khi frontend và backend không chạy chung 1 máy). Nếu không, suy ra
    // từ hostname hiện tại thay vì hardcode 'localhost'.
    const SOCKET_URL = API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    const newSocket = io(SOCKET_URL, { auth: { token } });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    setSocket(newSocket);
    newSocket.on('user_online', ({ userId }) =>
      setOnlineUsers(prev => new Set(prev).add(userId))
    );
    newSocket.on('user_offline', ({ userId }) =>
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      })
    );
    newSocket.on('user_status_changed', ({ userId, status }) =>
      setUserStatuses(prev => new Map(prev).set(userId, status))
    );

    return () => newSocket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, userStatuses }}>
      {children}
    </SocketContext.Provider>
  );
};
