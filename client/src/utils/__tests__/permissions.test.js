import { describe, test, expect } from 'vitest';
import { getRole, canDeleteMessage, canModerateMember, getDisplayName, canChangeRole } from '../permissions';

describe('getRole', () => {
  test('trả về null nếu thiếu server hoặc thiếu userId', () => {
    expect(getRole(null, 'u1')).toBeNull();
    expect(getRole({ owner: 'u1', members: [] }, null)).toBeNull();
  });

  test('nhận diện owner dù server.owner là raw id hay object đã populate', () => {
    const serverRawOwner = { owner: 'owner-1', members: [] };
    expect(getRole(serverRawOwner, 'owner-1')).toBe('owner');

    const serverPopulatedOwner = { owner: { _id: 'owner-1' }, members: [] };
    expect(getRole(serverPopulatedOwner, 'owner-1')).toBe('owner');
  });

  test('trả về đúng role của thành viên (không phải owner)', () => {
    const server = {
      owner: 'owner-1',
      members: [
        { user: 'mod-1', role: 'moderator' },
        { user: { _id: 'member-1' }, role: 'member' },
      ],
    };
    expect(getRole(server, 'mod-1')).toBe('moderator');
    expect(getRole(server, 'member-1')).toBe('member');
  });

  test('trả về null nếu user không nằm trong server', () => {
    const server = { owner: 'owner-1', members: [{ user: 'mod-1', role: 'moderator' }] };
    expect(getRole(server, 'stranger')).toBeNull();
  });
});

describe('canDeleteMessage', () => {
  test('owner xoá được tin nhắn của bất kỳ ai', () => {
    expect(canDeleteMessage('owner', 'owner')).toBe(true);
    expect(canDeleteMessage('owner', 'member')).toBe(true);
  });

  test('moderator xoá được tin của moderator/member, không xoá được tin của owner', () => {
    expect(canDeleteMessage('moderator', 'member')).toBe(true);
    expect(canDeleteMessage('moderator', 'moderator')).toBe(true);
    expect(canDeleteMessage('moderator', 'owner')).toBe(false);
  });

  test('member không xoá được tin nhắn của ai', () => {
    expect(canDeleteMessage('member', 'member')).toBe(false);
  });
});

describe('canModerateMember', () => {
  test('owner kick/ban được moderator & member, không nhắm được owner khác', () => {
    expect(canModerateMember('owner', 'moderator')).toBe(true);
    expect(canModerateMember('owner', 'member')).toBe(true);
    expect(canModerateMember('owner', 'owner')).toBe(false);
  });

  test('moderator chỉ kick/ban được member', () => {
    expect(canModerateMember('moderator', 'member')).toBe(true);
    expect(canModerateMember('moderator', 'moderator')).toBe(false);
    expect(canModerateMember('moderator', 'owner')).toBe(false);
  });

  test('member không kick/ban được ai', () => {
    expect(canModerateMember('member', 'member')).toBe(false);
  });
});

describe('getDisplayName', () => {
  const server = {
    members: [
      { user: 'u1', nickname: 'Biệt danh A' },
      { user: 'u2', nickname: null },
    ],
  };

  test('ưu tiên hiển thị nickname trong server nếu có', () => {
    expect(getDisplayName(server, 'u1', 'username-goc')).toBe('Biệt danh A');
  });

  test('fallback về username gốc nếu thành viên chưa đặt nickname', () => {
    expect(getDisplayName(server, 'u2', 'username-goc')).toBe('username-goc');
  });

  test('fallback về username gốc nếu không tìm thấy thành viên (vd server null lúc đang tải trang)', () => {
    expect(getDisplayName(null, 'u1', 'username-goc')).toBe('username-goc');
    expect(getDisplayName(server, 'u-khong-ton-tai', 'username-goc')).toBe('username-goc');
  });
});

describe('canChangeRole', () => {
  test('chỉ owner được đổi role thành viên khác', () => {
    expect(canChangeRole('owner')).toBe(true);
    expect(canChangeRole('moderator')).toBe(false);
    expect(canChangeRole('member')).toBe(false);
  });
});
