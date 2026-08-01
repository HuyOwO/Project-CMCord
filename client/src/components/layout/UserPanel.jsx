import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { useOnlineUsers, useUserStatuses } from '../../hooks/useSocket';
import { getEffectiveStatus } from '../../utils/status';
import { resolveFileUrl } from '../../config';
import StatusDot from '../common/StatusDot';
import ProfileModal from '../profile/ProfileModal';

// Panel hiển thị user hiện tại + nút đăng xuất, nằm ở đáy channel sidebar.
// Trước đây được copy y hệt trong cả HomePage và ChannelPage.
// displayName (tuỳ chọn): biệt danh của user trong server đang xem, mặc định lấy user.username.
//
// Milestone 3 (UI cải tiến): panel này tự quản lý ProfileModal (avatar/username/trạng thái/
// email/mật khẩu) bên trong chính nó, dùng useAuth() để lấy tài khoản gốc thay vì phụ thuộc
// props từ trang cha -- nhờ vậy không cần sửa lại mọi trang đang render UserPanel
// (HomePage, ChannelPage, DMPage, CoursesPage, CourseDetailPage) mỗi khi thêm tính năng hồ sơ mới.
export default function UserPanel({ user, onLogout, displayName }) {
  const { user: account } = useAuth(); // tài khoản gốc (avatar/status/hồ sơ), khác với `user` là prop hiển thị
  const onlineUsers = useOnlineUsers();
  const userStatuses = useUserStatuses();
  const [showProfile, setShowProfile] = useState(false);

  const name = displayName || user?.username;
  const accountId = account?._id;
  const storedStatus = userStatuses.get(accountId) ?? account?.status;
  const effectiveStatus = getEffectiveStatus(accountId, storedStatus, onlineUsers);
  const avatarUrl = account?.avatar ? resolveFileUrl(account.avatar) : null;

  return (
    <>
      <div className="p-3 bg-cm-bg flex items-center justify-between">
        <button
          onClick={() => setShowProfile(true)}
          title="Hồ sơ của bạn"
          className="flex items-center gap-2 min-w-0 hover:bg-cm-input rounded px-1 py-1 -mx-1"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-cm-accent flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                name?.[0]?.toUpperCase()
              )}
            </div>
            <StatusDot status={effectiveStatus} borderClass="border-cm-bg" />
          </div>
          <span className="text-cm-text text-sm font-medium truncate">{name}</span>
        </button>
        <button onClick={onLogout} className="text-cm-muted hover:text-white text-xs flex-shrink-0">
          Đăng xuất
        </button>
      </div>

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
}
