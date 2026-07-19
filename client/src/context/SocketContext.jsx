import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  // Kết nối lại socket mỗi khi trạng thái đăng nhập (user) thay đổi,
  // thay vì chỉ 1 lần lúc app khởi động (trước đây nếu chưa login lúc mount
  // thì socket sẽ mãi là null cho tới khi F5 lại trang).
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      setSocket(null);
      return;
    }

    const newSocket = io('http://localhost:5000', { auth: { token } });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
