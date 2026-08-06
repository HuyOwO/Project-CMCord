const { resolveChannelPermission } = require('../../src/utils/channelPermissions');

// ────────────────────────────────────────────────────────────────────────────
// resolveChannelPermission(channel, actorRole)
// ────────────────────────────────────────────────────────────────────────────
describe('resolveChannelPermission', () => {
  test('owner luôn toàn quyền, bất kể permissionOverrides quy định gì', () => {
    const channel = {
      permissionOverrides: [
        { role: 'moderator', canView: false, canSend: false },
        { role: 'member', canView: false, canSend: false },
      ],
    };
    expect(resolveChannelPermission(channel, 'owner')).toEqual({ canView: true, canSend: true });
  });

  test('channel chưa có permissionOverrides -> mọi role đều xem + nhắn được (tương thích ngược)', () => {
    const channel = { permissionOverrides: [] };
    expect(resolveChannelPermission(channel, 'moderator')).toEqual({ canView: true, canSend: true });
    expect(resolveChannelPermission(channel, 'member')).toEqual({ canView: true, canSend: true });
  });

  test('channel không có field permissionOverrides (undefined) -> vẫn coi như không giới hạn', () => {
    const channel = {};
    expect(resolveChannelPermission(channel, 'member')).toEqual({ canView: true, canSend: true });
  });

  test('role không có entry trong permissionOverrides -> mặc định xem + nhắn được', () => {
    const channel = { permissionOverrides: [{ role: 'member', canView: true, canSend: false }] };
    expect(resolveChannelPermission(channel, 'moderator')).toEqual({ canView: true, canSend: true });
  });

  test('role bị giới hạn "chỉ xem" -> canView true, canSend false', () => {
    const channel = { permissionOverrides: [{ role: 'member', canView: true, canSend: false }] };
    expect(resolveChannelPermission(channel, 'member')).toEqual({ canView: true, canSend: false });
  });

  test('role bị cấm xem hoàn toàn -> canSend cũng phải false dù dữ liệu lưu canSend: true', () => {
    // Trường hợp phòng hờ dữ liệu không nhất quán (canView false nhưng canSend true) --
    // canSend luôn bị ép về false vì không thể nhắn ở kênh không được xem.
    const channel = { permissionOverrides: [{ role: 'member', canView: false, canSend: true }] };
    expect(resolveChannelPermission(channel, 'member')).toEqual({ canView: false, canSend: false });
  });

  test('role được xem + nhắn đầy đủ khi override khai báo rõ cả hai đều true', () => {
    const channel = { permissionOverrides: [{ role: 'moderator', canView: true, canSend: true }] };
    expect(resolveChannelPermission(channel, 'moderator')).toEqual({ canView: true, canSend: true });
  });

  test('actorRole null (không phải thành viên) -> không khớp entry nào, không đại diện cho quyền thật', () => {
    // Lưu ý: hàm này giả định actorRole đã được xác thực là thành viên hợp lệ từ trước
    // (controller luôn kiểm tra getRole() trả về khác null trước khi gọi hàm này).
    const channel = { permissionOverrides: [{ role: 'member', canView: false, canSend: false }] };
    expect(resolveChannelPermission(channel, null)).toEqual({ canView: true, canSend: true });
  });
});
