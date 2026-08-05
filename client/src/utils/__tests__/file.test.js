import { describe, test, expect } from 'vitest';
import { formatFileSize, MAX_FILE_SIZE } from '../file';

describe('formatFileSize', () => {
  test('hiển thị đơn vị B khi nhỏ hơn 1024 byte', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  test('hiển thị đơn vị KB (làm tròn) khi từ 1024 byte đến dưới 1MB', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(1536)).toBe('2 KB'); // 1.5KB làm tròn lên 2KB
    expect(formatFileSize(1024 * 1024 - 1)).toBe('1024 KB');
  });

  test('hiển thị đơn vị MB (1 chữ số thập phân) khi từ 1MB trở lên', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  test('giới hạn MAX_FILE_SIZE (8MB) hiển thị đúng "8.0 MB" -- khớp với thông báo lỗi phía backend', () => {
    expect(formatFileSize(MAX_FILE_SIZE)).toBe('8.0 MB');
  });
});

describe('MAX_FILE_SIZE', () => {
  test('bằng đúng 8MB tính theo byte, phải khớp với limits.fileSize ở server/src/middleware/uploadMiddleware.js', () => {
    expect(MAX_FILE_SIZE).toBe(8 * 1024 * 1024);
  });
});
