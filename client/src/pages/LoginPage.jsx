import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center px-4">
      <div className="bg-cm-sidebar rounded-lg p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Chào mừng trở lại!</h1>
        <p className="text-cm-muted text-center text-sm mb-6">Đăng nhập để tiếp tục với CMCord</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cm-text text-xs font-semibold uppercase mb-1">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
          </div>
          <div>
            <label className="block text-cm-text text-xs font-semibold uppercase mb-1">Mật khẩu</label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-cm-muted text-sm text-center mt-4">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-cm-accent hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
