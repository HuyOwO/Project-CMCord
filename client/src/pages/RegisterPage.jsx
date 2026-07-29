import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm)
      return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text') => (
    <div>
      <label className="block text-cm-text text-xs font-semibold uppercase mb-1">{label}</label>
      <input
        type={type} required
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center px-4">
      <div className="bg-cm-sidebar rounded-lg p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Tạo tài khoản</h1>
        <p className="text-cm-muted text-center text-sm mb-6">Tham gia CMCord ngay hôm nay!</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('Tên hiển thị', 'username')}
          {field('Email', 'email', 'email')}
          {field('Mật khẩu', 'password', 'password')}
          {field('Xác nhận mật khẩu', 'confirm', 'password')}
          <button
            type="submit" disabled={loading}
            className="w-full bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-cm-muted text-sm text-center mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-cm-accent hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
