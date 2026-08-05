const { getRole, canDeleteMessage, canModerateMember, canChangeRole } = require('../../src/utils/permissions');

// ────────────────────────────────────────────────────────────────────────────
// getRole(server, userId)
// ────────────────────────────────────────────────────────────────────────────
describe('getRole', () => {
  const ownerId = 'user-owner';
  const modId = 'user-mod';
  const memberId = 'user-member';
  const strangerId = 'user-stranger';

  const server = {
    owner: ownerId,
    members: [
      { user: ownerId, role: 'moderator' }, // owner cũng nằm trong members[] (xem serverController.createServer)
      { user: modId, role: 'moderator' },
      { user: memberId, role: 'member' },
    ],
  };

  test('trả về "owner" nếu userId trùng server.owner, bất kể role lưu trong members[]', () => {
    expect(getRole(server, ownerId)).toBe('owner');
  });

  test('trả về đúng role lưu trong members[] cho user không phải owner', () => {
    expect(getRole(server, modId)).toBe('moderator');
    expect(getRole(server, memberId)).toBe('member');
  });

  test('trả về null nếu user không nằm trong server', () => {
    expect(getRole(server, strangerId)).toBeNull();
  });

  test('hoạt động đúng khi members[].user đã được populate (object có _id) thay vì raw id', () => {
    const populatedServer = {
      owner: { toString: () => ownerId }, // giả lập ObjectId
      members: [
        { user: { _id: { toString: () => memberId } }, role: 'member' },
      ],
    };
    expect(getRole(populatedServer, { toString: () => memberId })).toBe('member');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// canDeleteMessage(actorRole, authorRole)
// ────────────────────────────────────────────────────────────────────────────
describe('canDeleteMessage', () => {
  test('owner được xoá tin nhắn của bất kỳ ai, kể cả owner khác/chính mình', () => {
    expect(canDeleteMessage('owner', 'owner')).toBe(true);
    expect(canDeleteMessage('owner', 'moderator')).toBe(true);
    expect(canDeleteMessage('owner', 'member')).toBe(true);
  });

  test('moderator được xoá tin nhắn của moderator khác và member, KHÔNG được xoá tin của owner', () => {
    expect(canDeleteMessage('moderator', 'member')).toBe(true);
    expect(canDeleteMessage('moderator', 'moderator')).toBe(true);
    expect(canDeleteMessage('moderator', 'owner')).toBe(false);
  });

  test('member không được xoá tin nhắn của ai (kể cả member khác)', () => {
    expect(canDeleteMessage('member', 'member')).toBe(false);
    expect(canDeleteMessage('member', 'moderator')).toBe(false);
    expect(canDeleteMessage('member', 'owner')).toBe(false);
  });

  test('actorRole null (không phải thành viên) không được xoá gì', () => {
    expect(canDeleteMessage(null, 'member')).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// canModerateMember(actorRole, targetRole)  -- dùng cho kick/ban
// ────────────────────────────────────────────────────────────────────────────
describe('canModerateMember', () => {
  test('owner kick/ban được moderator và member, KHÔNG được nhắm vào owner khác', () => {
    expect(canModerateMember('owner', 'moderator')).toBe(true);
    expect(canModerateMember('owner', 'member')).toBe(true);
    expect(canModerateMember('owner', 'owner')).toBe(false);
  });

  test('moderator chỉ kick/ban được member, KHÔNG được nhắm vào moderator khác hay owner', () => {
    expect(canModerateMember('moderator', 'member')).toBe(true);
    expect(canModerateMember('moderator', 'moderator')).toBe(false);
    expect(canModerateMember('moderator', 'owner')).toBe(false);
  });

  test('member không kick/ban được ai', () => {
    expect(canModerateMember('member', 'member')).toBe(false);
    expect(canModerateMember('member', 'moderator')).toBe(false);
    expect(canModerateMember('member', 'owner')).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// canChangeRole(actorRole) -- thăng/hạ quyền moderator
// ────────────────────────────────────────────────────────────────────────────
describe('canChangeRole', () => {
  test('chỉ owner được đổi role thành viên khác', () => {
    expect(canChangeRole('owner')).toBe(true);
  });

  test('moderator và member đều KHÔNG được đổi role', () => {
    expect(canChangeRole('moderator')).toBe(false);
    expect(canChangeRole('member')).toBe(false);
  });

  test('actorRole null (không phải thành viên) không được đổi role', () => {
    expect(canChangeRole(null)).toBe(false);
  });
});
