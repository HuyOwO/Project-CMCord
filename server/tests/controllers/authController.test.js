process.env.JWT_SECRET = 'test-secret-for-jest';

// Mock hẳn Model thay vì mongoose thật -- test này chỉ quan tâm LOGIC của controller
// (validate, so khớp mật khẩu, mã trạng thái HTTP trả về), không cần kết nối MongoDB thật.
jest.mock('../../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));

const User = require('../../src/models/User');
const { register, login, getMe, changePassword } = require('../../src/controllers/authController');
const { mockResponse } = require('../testUtils');

describe('authController.register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trả về 400 nếu thiếu bất kỳ trường bắt buộc nào', async () => {
    const req = { body: { username: 'huy', email: '', password: '12345678' } };
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'All fields are required' })
    );
    expect(User.findOne).not.toHaveBeenCalled(); // validate fail sớm -> không được đụng tới DB
  });

  test('trả về 400 nếu email hoặc username đã tồn tại', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing-id' }); // giả lập đã có user trùng
    const req = { body: { username: 'huy', email: 'huy@cmc.edu.vn', password: '12345678' } };
    const res = mockResponse();

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      $or: [{ email: 'huy@cmc.edu.vn' }, { username: 'huy' }],
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Email or username already taken' })
    );
    expect(User.create).not.toHaveBeenCalled();
  });

  test('tạo tài khoản thành công trả về 201 kèm token khi dữ liệu hợp lệ và chưa tồn tại', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'new-user-id', username: 'huy', email: 'huy@cmc.edu.vn' });
    const req = { body: { username: 'huy', email: 'huy@cmc.edu.vn', password: '12345678' } };
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.user._id).toBe('new-user-id');
    expect(typeof payload.data.token).toBe('string');
    expect(payload.data.token.split('.')).toHaveLength(3); // JWT hợp lệ có 3 phần header.payload.signature
  });

  test('trả về 500 kèm message lỗi nếu Model ném lỗi bất ngờ (vd mất kết nối DB)', async () => {
    User.findOne.mockRejectedValue(new Error('DB connection lost'));
    const req = { body: { username: 'huy', email: 'huy@cmc.edu.vn', password: '12345678' } };
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'DB connection lost' })
    );
  });
});

describe('authController.login', () => {
  beforeEach(() => jest.clearAllMocks());

  // Mô phỏng chuỗi gọi thật của Mongoose: User.findOne(...).select('+password')
  const buildSelectableQuery = (resolvedUser) => ({
    select: jest.fn().mockResolvedValue(resolvedUser),
  });

  test('trả về 401 nếu email không tồn tại trong hệ thống', async () => {
    User.findOne.mockReturnValue(buildSelectableQuery(null));
    const req = { body: { email: 'khong-ton-tai@cmc.edu.vn', password: 'anything123' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Invalid email or password' })
    );
  });

  test('trả về 401 nếu email đúng nhưng mật khẩu sai', async () => {
    const fakeUser = { _id: 'u1', comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockReturnValue(buildSelectableQuery(fakeUser));
    const req = { body: { email: 'huy@cmc.edu.vn', password: 'sai-mat-khau' } };
    const res = mockResponse();

    await login(req, res);

    expect(fakeUser.comparePassword).toHaveBeenCalledWith('sai-mat-khau');
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('đăng nhập thành công trả về 200 kèm token khi email/mật khẩu đúng', async () => {
    const fakeUser = { _id: 'u1', username: 'huy', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockReturnValue(buildSelectableQuery(fakeUser));
    const req = { body: { email: 'huy@cmc.edu.vn', password: 'dung-mat-khau' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).not.toHaveBeenCalledWith(401);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data.user).toBe(fakeUser);
    expect(typeof payload.data.token).toBe('string');
  });

  test('trả về 500 kèm message lỗi nếu Model ném lỗi bất ngờ khi đăng nhập', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB timeout')) });
    const req = { body: { email: 'huy@cmc.edu.vn', password: 'anything123' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'DB timeout' }));
  });
});

describe('authController.getMe', () => {
  test('trả về đúng thông tin user đã được authMiddleware gắn vào req.user (không tự query lại DB)', async () => {
    const req = { user: { _id: 'u1', username: 'huy' } };
    const res = mockResponse();

    await getMe(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: req.user });
  });
});

describe('authController.changePassword', () => {
  beforeEach(() => jest.clearAllMocks());

  test('trả về 400 nếu mật khẩu cũ nhập sai, KHÔNG được lưu mật khẩu mới', async () => {
    const fakeUser = { comparePassword: jest.fn().mockResolvedValue(false), save: jest.fn() };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    const req = { user: { _id: 'u1' }, body: { oldPassword: 'sai', newPassword: 'mat-khau-moi-123' } };
    const res = mockResponse();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Mật khẩu cũ không đúng' }));
    expect(fakeUser.save).not.toHaveBeenCalled(); // đây là điểm quan trọng nhất cần test: không lưu nếu xác thực fail
  });

  test('đổi mật khẩu thành công khi mật khẩu cũ đúng -- phải gọi save() để trigger hash lại qua pre-save hook', async () => {
    const fakeUser = {
      password: 'old-hash',
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    const req = { user: { _id: 'u1' }, body: { oldPassword: 'dung', newPassword: 'mat-khau-moi-123' } };
    const res = mockResponse();

    await changePassword(req, res);

    expect(fakeUser.password).toBe('mat-khau-moi-123'); // controller gán password mới trước khi save
    expect(fakeUser.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: 'Đổi mật khẩu thành công' })
    );
  });

  test('trả về 500 kèm message lỗi nếu Model ném lỗi bất ngờ khi đổi mật khẩu', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('DB timeout')) });
    const req = { user: { _id: 'u1' }, body: { oldPassword: 'dung', newPassword: 'mat-khau-moi-123' } };
    const res = mockResponse();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'DB timeout' }));
  });
});
