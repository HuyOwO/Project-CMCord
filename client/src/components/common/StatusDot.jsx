import { STATUS_META } from '../../utils/status';

// Chấm tròn màu thể hiện trạng thái (dùng chung cho UserPanel, MemberListPanel,
// FriendsPanel, DMSidebar). borderClass nên khớp với màu nền của khối chứa avatar
// (vd border-cm-sidebar, border-cm-surface, border-cm-bg) để chấm không bị dính viền lạ.
export default function StatusDot({ status, borderClass = 'border-cm-sidebar', className = '' }) {
  const meta = STATUS_META[status] || STATUS_META.offline;
  return (
    <span
      title={meta.label}
      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${borderClass} ${meta.dotClass} ${className}`}
    />
  );
}
