import { describe, test, expect } from 'vitest';
import { resolveChannelPermission } from '../channelPermissions';

describe('resolveChannelPermission', () => {
  test('owner luôn toàn quyền, bất kể permissionOverrides quy định gì', () => {
    const channel = { permissionOverrides: [{ role: 'moderator', canView: false, canSend: false }] };
    expect(resolveChannelPermission(channel, 'owner')).toEqual({ canView: true, canSend: true });
  });

  test('channel chưa cấu hình (không có permissionOverrides) -> mọi role xem + nhắn được', () => {
    expect(resolveChannelPermission(undefined, 'member')).toEqual({ canView: true, canSend: true });
    expect(resolveChannelPermission({}, 'member')).toEqual({ canView: true, canSend: true });
  });

  test('role không có entry -> mặc định xem + nhắn được', () => {
    const channel = { permissionOverrides: [{ role: 'member', canView: true, canSend: false }] };
    expect(resolveChannelPermission(channel, 'moderator')).toEqual({ canView: true, canSend: true });
  });

  test('role bị giới hạn "chỉ xem" -> canSend false', () => {
    const channel = { permissionOverrides: [{ role: 'member', canView: true, canSend: false }] };
    expect(resolveChannelPermission(channel, 'member')).toEqual({ canView: true, canSend: false });
  });

  test('không xem được thì cũng không nhắn được, dù dữ liệu canSend lưu true', () => {
    const channel = { permissionOverrides: [{ role: 'member', canView: false, canSend: true }] };
    expect(resolveChannelPermission(channel, 'member')).toEqual({ canView: false, canSend: false });
  });
});
