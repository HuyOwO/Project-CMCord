// Mock hẳn Model, dùng getRole/resolveChannelPermission thật (pure function, không đụng DB)
// để test được đúng hành vi thật của controller khi ghép các mảnh lại với nhau.
jest.mock('../../src/models/Channel', () => ({
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));
jest.mock('../../src/models/Server', () => ({
  findById: jest.fn(),
}));

const Channel = require('../../src/models/Channel');
const ServerModel = require('../../src/models/Server');
const { getChannels, updateChannelPermissions } = require('../../src/controllers/channelController');
const { mockResponse } = require('../testUtils');

const ownerId = 'user-owner';
const modId = 'user-mod';
const memberId = 'user-member';
const strangerId = 'user-stranger';

const buildServer = () => ({
  owner: ownerId,
  members: [
    { user: ownerId, role: 'moderator' },
    { user: modId, role: 'moderator' },
    { user: memberId, role: 'member' },
  ],
});

describe('channelController.getChannels', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trả về 404 nếu server không tồn tại', async () => {
    ServerModel.findById.mockResolvedValue(null);
    const req = { params: { serverId: 's1' }, user: { _id: memberId } };
    const res = mockResponse();

    await getChannels(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('trả về 403 nếu không phải thành viên server', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = { params: { serverId: 's1' }, user: { _id: strangerId } };
    const res = mockResponse();

    await getChannels(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Channel.find).not.toHaveBeenCalled();
  });

  test('member bị lọc mất kênh mà role của họ không được xem, moderator vẫn thấy đủ', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const general = { _id: 'c-general', name: 'general', permissionOverrides: [] };
    const modOnly = {
      _id: 'c-mod-only',
      name: 'mod-only',
      permissionOverrides: [{ role: 'member', canView: false, canSend: false }],
    };
    Channel.find.mockResolvedValue([general, modOnly]);

    const resMember = mockResponse();
    await getChannels({ params: { serverId: 's1' }, user: { _id: memberId } }, resMember);
    expect(resMember.json).toHaveBeenCalledWith({ success: true, data: [general] });

    const resMod = mockResponse();
    await getChannels({ params: { serverId: 's1' }, user: { _id: modId } }, resMod);
    expect(resMod.json).toHaveBeenCalledWith({ success: true, data: [general, modOnly] });
  });

  test('owner luôn thấy mọi kênh kể cả kênh giới hạn cả moderator lẫn member', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const hidden = {
      _id: 'c-hidden',
      permissionOverrides: [
        { role: 'moderator', canView: false, canSend: false },
        { role: 'member', canView: false, canSend: false },
      ],
    };
    Channel.find.mockResolvedValue([hidden]);
    const res = mockResponse();

    await getChannels({ params: { serverId: 's1' }, user: { _id: ownerId } }, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: [hidden] });
  });
});

describe('channelController.updateChannelPermissions', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trả về 403 nếu actor không phải owner', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = {
      params: { serverId: 's1', id: 'c1' },
      user: { _id: modId },
      body: { overrides: [] },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(Channel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('trả về 400 nếu overrides không phải mảng', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = {
      params: { serverId: 's1', id: 'c1' },
      user: { _id: ownerId },
      body: { overrides: 'not-an-array' },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('trả về 400 nếu có role không hợp lệ (vd "owner" hoặc role lạ)', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = {
      params: { serverId: 's1', id: 'c1' },
      user: { _id: ownerId },
      body: { overrides: [{ role: 'owner', canView: true, canSend: true }] },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Channel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('trả về 400 nếu 1 role bị khai báo lặp lại', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = {
      params: { serverId: 's1', id: 'c1' },
      user: { _id: ownerId },
      body: {
        overrides: [
          { role: 'member', canView: true, canSend: true },
          { role: 'member', canView: false, canSend: false },
        ],
      },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Channel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test('tự động ép canSend về false khi canView false, không trả lỗi', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    Channel.findOneAndUpdate.mockResolvedValue({ _id: 'c1', permissionOverrides: [] });
    const req = {
      params: { serverId: 's1', id: 'c1' },
      user: { _id: ownerId },
      body: { overrides: [{ role: 'member', canView: false, canSend: true }] },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(Channel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'c1', server: 's1' },
      { permissionOverrides: [{ role: 'member', canView: false, canSend: false }] },
      { new: true }
    );
    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  test('owner lưu thành công override hợp lệ cho cả moderator và member', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    const updated = { _id: 'c1', permissionOverrides: [{ role: 'member', canView: true, canSend: false }] };
    Channel.findOneAndUpdate.mockResolvedValue(updated);
    const req = {
      params: { serverId: 's1', id: 'c1' },
      user: { _id: ownerId },
      body: {
        overrides: [
          { role: 'moderator', canView: true, canSend: true },
          { role: 'member', canView: true, canSend: false },
        ],
      },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
  });

  test('trả về 404 nếu channel không tồn tại/không thuộc server này', async () => {
    ServerModel.findById.mockResolvedValue(buildServer());
    Channel.findOneAndUpdate.mockResolvedValue(null);
    const req = {
      params: { serverId: 's1', id: 'c-khong-ton-tai' },
      user: { _id: ownerId },
      body: { overrides: [] },
    };
    const res = mockResponse();

    await updateChannelPermissions(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
