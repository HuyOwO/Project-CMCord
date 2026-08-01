import { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';
import useAuth from '../../hooks/useAuth';
import { userService, authService } from '../../services';
import { resolveFileUrl } from '../../config';
import { STATUS_OPTIONS } from '../../utils/status';
import { MAX_FILE_SIZE, formatFileSize } from '../../utils/file';

const TABS = [
  { key: 'profile', label: 'Hồ sơ' },
  { key: 'security', label: 'Bảo mật' },
];

// Modal quản lý tài khoản cá nhân.
// Tab "Hồ sơ": đổi username, ảnh đại diện, trạng thái (Có mặt/Đang chờ/Vắng mặt) -- KHÔNG
// cần nhập lại mật khẩu (rủi ro thấp, giống Discord đổi display name/avatar).
// Tab "Bảo mật": đổi email và đổi mật khẩu -- CẢ HAI đều bắt buộc xác nhận lại mật khẩu
// hiện tại vì đây là thông tin nhạy cảm (đổi được là có thể chiếm tài khoản).
export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');

  // ── Hồ sơ ──
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('online');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  // ── Email ──
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // ── Mật khẩu ──
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Reset toàn bộ form mỗi lần mở lại modal, nạp giá trị hiện tại từ tài khoản.
  useEffect(() => {
    if (isOpen && user) {
      setTab('profile');
      setUsername(user.username || '');
      setStatus(user.status || 'online');
      setProfileError('');
      setProfileSuccess('');
      setAvatarError('');
      setNewEmail('');
      setEmailPassword('');
      setEmailError('');
      setEmailSuccess('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setPasswordSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const updated = await userService.updateProfile({ username: username.trim(), status });
      updateUser(updated);
      setProfileSuccess('Đã lưu thay đổi.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Lưu hồ sơ thất bại, vui lòng thử lại.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError(`Ảnh "${file.name}" vượt quá ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const updated = await userService.uploadAvatar(file);
      updateUser(updated);
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !emailPassword) return;
    setEmailSaving(true);
    setEmailError('');
    setEmailSuccess('');
    try {
      const updated = await userService.updateEmail(newEmail.trim(), emailPassword);
      updateUser(updated);
      setNewEmail('');
      setEmailPassword('');
      setEmailSuccess('Đã đổi email thành công.');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Đổi email thất bại, vui lòng thử lại.');
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await authService.changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Đã đổi mật khẩu thành công.');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const avatarUrl = user?.avatar ? resolveFileUrl(user.avatar) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClass="w-[420px]">
      <h2 className="text-white font-bold text-lg mb-4">Tài khoản của tôi</h2>

      <div className="flex gap-1 mb-4 border-b border-cm-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-3 py-2 -mb-px border-b-2 ${
              tab === t.key
                ? 'border-cm-accent text-white'
                : 'border-transparent text-cm-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative w-16 h-16 rounded-full bg-cm-accent flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden group"
              title="Đổi ảnh đại diện"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase()
              )}
              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] transition-opacity">
                {avatarUploading ? '...' : 'Đổi ảnh'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-cm-muted text-xs truncate">{user?.email}</p>
            </div>
          </div>
          {avatarError && <p className="text-red-400 text-xs">{avatarError}</p>}

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="text-cm-muted text-xs block mb-1">Tên hiển thị</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
              />
            </div>

            <div>
              <label className="text-cm-muted text-xs block mb-1.5">Trạng thái</label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border ${
                      status === opt.value
                        ? 'border-cm-accent bg-cm-accent/10 text-white'
                        : 'border-cm-border text-cm-muted hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {profileError && <p className="text-red-400 text-xs">{profileError}</p>}
            {profileSuccess && <p className="text-cm-green text-xs">{profileSuccess}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileSaving || !username.trim()}
                className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded"
              >
                {profileSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-5">
          <form onSubmit={handleChangeEmail} className="space-y-2">
            <p className="text-white text-sm font-semibold">Đổi email</p>
            <p className="text-cm-muted text-xs">Email hiện tại: {user?.email}</p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email mới"
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Mật khẩu hiện tại (để xác nhận)"
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
            {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
            {emailSuccess && <p className="text-cm-green text-xs">{emailSuccess}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={emailSaving || !newEmail.trim() || !emailPassword}
                className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded"
              >
                {emailSaving ? 'Đang lưu...' : 'Đổi email'}
              </button>
            </div>
          </form>

          <form onSubmit={handleChangePassword} className="space-y-2 pt-4 border-t border-cm-border">
            <p className="text-white text-sm font-semibold">Đổi mật khẩu</p>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Mật khẩu hiện tại"
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full bg-cm-input text-cm-text rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cm-accent"
            />
            {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
            {passwordSuccess && <p className="text-cm-green text-xs">{passwordSuccess}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving || !oldPassword || !newPassword}
                className="px-4 py-1.5 bg-cm-accent hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded"
              >
                {passwordSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-end pt-4 mt-2 border-t border-cm-border">
        <button onClick={onClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
          Đóng
        </button>
      </div>
    </Modal>
  );
}
