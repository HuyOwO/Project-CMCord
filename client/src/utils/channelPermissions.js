// Bản sao logic của server/src/utils/channelPermissions.js, dùng để quyết định UI
// (disable ô nhập tin nhắn, hiện badge "chỉ xem", v.v.) mà không cần chờ round-trip lên server.
// Server vẫn là nơi enforce thật sự — file này chỉ phục vụ hiển thị.
export const resolveChannelPermission = (channel, actorRole) => {
  if (actorRole === 'owner') return { canView: true, canSend: true };

  const override = channel?.permissionOverrides?.find((o) => o.role === actorRole);
  if (!override) return { canView: true, canSend: true };

  const canView = Boolean(override.canView);
  return { canView, canSend: canView && Boolean(override.canSend) };
};
