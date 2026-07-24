import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage     from './pages/HomePage';
import ChannelPage  from './pages/ChannelPage';
import DMPage       from './pages/DMPage';
import useAuth      from './hooks/useAuth';

// Chặn route khi chưa đăng nhập
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-cm-muted">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
    <Route path="/channels/:serverId/:channelId" element={<PrivateRoute><ChannelPage /></PrivateRoute>} />
    <Route path="/dm" element={<PrivateRoute><DMPage /></PrivateRoute>} />
    <Route path="/dm/:conversationId" element={<PrivateRoute><DMPage /></PrivateRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
