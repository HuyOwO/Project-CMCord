const { getUploadedFileUrl } = require('../../src/utils/fileUrl');

describe('getUploadedFileUrl', () => {
  test('trả về null nếu không có file (không đính kèm)', () => {
    expect(getUploadedFileUrl(null)).toBeNull();
    expect(getUploadedFileUrl(undefined)).toBeNull();
  });

  test('trả về nguyên path nếu là secure_url của Cloudinary (https://...)', () => {
    const file = { path: 'https://res.cloudinary.com/demo/image/upload/v1/cmcord/attachments/abc.png' };
    expect(getUploadedFileUrl(file)).toBe(file.path);
  });

  test('cũng nhận diện path dạng http:// (không chỉ https)', () => {
    const file = { path: 'http://res.cloudinary.com/demo/image/upload/abc.png' };
    expect(getUploadedFileUrl(file)).toBe(file.path);
  });

  test('ghép thành /uploads/<filename> khi lưu đĩa cục bộ (path là đường dẫn ổ đĩa, không phải URL)', () => {
    const file = { path: '/home/server/uploads/1699999999-123456789.png', filename: '1699999999-123456789.png' };
    expect(getUploadedFileUrl(file)).toBe('/uploads/1699999999-123456789.png');
  });

  test('path không bắt đầu bằng http(s):// (dù có chứa chữ "http" ở đâu đó) vẫn được coi là lưu đĩa cục bộ', () => {
    const file = { path: 'uploads/not-a-url-http-fake.png', filename: 'not-a-url-http-fake.png' };
    expect(getUploadedFileUrl(file)).toBe('/uploads/not-a-url-http-fake.png');
  });
});
