// Tính quyền xem/nhắn tin hiệu lực của 1 actor (theo role SERVER: owner/moderator/member)
// trong 1 channel cụ thể, dựa vào channel.permissionOverrides.
//
// Quy tắc:
// - actorRole === 'owner' -> luôn toàn quyền, KHÔNG bao giờ bị permissionOverrides giới hạn.
// - Role không có entry trong permissionOverrides -> mặc định canView=true, canSend=true
//   (giữ tương thích ngược: kênh chưa từng cấu hình thì ai cũng xem + nhắn được như trước).
// - canSend chỉ có hiệu lực khi canView cũng true — không thể nhắn tin ở kênh mà
//   bản thân không được phép xem.
const resolveChannelPermission = (channel, actorRole) => {
  if (actorRole === 'owner') return { canView: true, canSend: true };

  const override = channel?.permissionOverrides?.find((o) => o.role === actorRole);
  if (!override) return { canView: true, canSend: true };

  const canView = Boolean(override.canView);
  return { canView, canSend: canView && Boolean(override.canSend) };
};

module.exports = { resolveChannelPermission };
