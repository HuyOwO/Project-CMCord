jest.mock('../../src/models/Message', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../src/models/Channel', () => ({
  findById: jest.fn(),
}));
jest.mock('../../src/models/Server', () => ({
  findById: jest.fn(),
}));

const Message = require('../../src/models/Message');
const Channel = require('../../src/models/Channel');
const ServerModel = require('../../src/models/Server');
const { getMessages, sendMessage } = require('../../src/controllers/messageController');
const { mockResponse } = require('../testUtils');

const ownerId = 'user-owner';
const memberId = 'user-member';
const strangerId = 'user-stranger';

const buildServer = () => ({
  owner: ownerId,
  members: [
    { user: ownerId, role: 'moderator' },
    { user: memberId, role: 'member' },
  ],
});

// Giả lập chuỗi gọi thật của Mongoose: Message.find(...).populate().sort().skip().limit()
const buildMessageQuery = (result) => {
  const query = {};
  query.populate = jest.fn().mockReturnValue(query);
  query.sort = jest.fn().mockReturnValue(query);
  query.skip = jest.fn().mockReturnValue(query);
  query.limit = jest.fn().mockResolvedValue(result);
  return query;
};

const fakeApp = { get: jest.fn().mockReturnValue(undefined) }; // io không cần thật, chỉ cần req.app.get('io') không văng lỗi

describe('messageController.getMessages', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trả về 404 nếu channel không tồn tại', async () => {
    Channel.findById.mockResolvedValue(null);
    const req = { params: { channelId: 'c1' }, query: {}, user: { _id: memberId } };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('trả về 403 "Not a member" nếu không phải thành viên server chứa channel', async () => {
    Channel.findById.mockResolvedValue({ _id: 'c1', server: 's1', permissionOverrides: [] });
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = { params: { channelId: 'c1' }, query: {}, user: { _id: strangerId } };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Not a member' }));
    expect(Message.find).not.toHaveBeenCalled();
  });

  test('trả về 403 riêng "Không có quyền xem kênh này" nếu là thành viên server nhưng bị chặn xem kênh', async () => {
    Channel.findById.mockResolvedValue({
      _id: 'c1', server: 's1',
      permissionOverrides: [{ role: 'member', canView: false, canSend: false }],
    });
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = { params: { channelId: 'c1' }, query: {}, user: { _id: memberId } };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Không có quyền xem kênh này' }));
    expect(Message.find).not.toHaveBeenCalled();
  });

  test('trả về danh sách tin nhắn khi có quyền xem', async () => {
    Channel.findById.mockResolvedValue({ _id: 'c1', server: 's1', permissionOverrides: [] });
    ServerModel.findById.mockResolvedValue(buildServer());
    Message.find.mockReturnValue(buildMessageQuery([{ _id: 'm2' }, { _id: 'm1' }]));
    const req = { params: { channelId: 'c1' }, query: {}, user: { _id: memberId } };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ _id: 'm1' }, { _id: 'm2' }] });
  });

  test('owner luôn xem được kể cả khi member/moderator bị chặn xem kênh', async () => {
    Channel.findById.mockResolvedValue({
      _id: 'c1', server: 's1',
      permissionOverrides: [{ role: 'moderator', canView: false, canSend: false }],
    });
    ServerModel.findById.mockResolvedValue(buildServer());
    Message.find.mockReturnValue(buildMessageQuery([]));
    const req = { params: { channelId: 'c1' }, query: {}, user: { _id: ownerId } };
    const res = mockResponse();

    await getMessages(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
  });
});

describe('messageController.sendMessage', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trả về 403 "Không có quyền nhắn tin trong kênh này" nếu role chỉ được xem, không được gửi', async () => {
    Channel.findById.mockResolvedValue({
      _id: 'c1', server: 's1',
      permissionOverrides: [{ role: 'member', canView: true, canSend: false }],
    });
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = { params: { channelId: 'c1' }, body: { content: 'hi' }, user: { _id: memberId }, app: fakeApp };
    const res = mockResponse();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Không có quyền nhắn tin trong kênh này' }));
    expect(Message.create).not.toHaveBeenCalled();
  });

  test('trả về 403 "Not a member" nếu không thuộc server chứa channel', async () => {
    Channel.findById.mockResolvedValue({ _id: 'c1', server: 's1', permissionOverrides: [] });
    ServerModel.findById.mockResolvedValue(buildServer());
    const req = { params: { channelId: 'c1' }, body: { content: 'hi' }, user: { _id: strangerId }, app: fakeApp };
    const res = mockResponse();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Not a member' }));
  });

  test('gửi tin nhắn thành công khi có quyền canSend', async () => {
    Channel.findById.mockResolvedValue({ _id: 'c1', server: 's1', permissionOverrides: [] });
    ServerModel.findById.mockResolvedValue(buildServer());
    const created = { _id: 'm1', content: 'hi', populate: jest.fn().mockResolvedValue(undefined) };
    Message.create.mockResolvedValue(created);
    const req = { params: { channelId: 'c1' }, body: { content: 'hi' }, user: { _id: memberId }, app: fakeApp };
    const res = mockResponse();

    await sendMessage(req, res);

    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'hi', author: memberId, channel: 'c1' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
