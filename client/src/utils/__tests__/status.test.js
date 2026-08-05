import { describe, test, expect } from 'vitest';
import { getEffectiveStatus, STATUS_META, STATUS_OPTIONS } from '../status';

describe('getEffectiveStatus', () => {
  test('trả về "offline" nếu thiếu userId, bất kể onlineUsers gì', () => {
    const onlineUsers = new Set(['u1']);
    expect(getEffectiveStatus(null, 'online', onlineUsers)).toBe('offline');
    expect(getEffectiveStatus(undefined, 'online', onlineUsers)).toBe('offline');
  });

  test('trả về "offline" nếu userId không có trong onlineUsers (đã ngắt kết nối)', () => {
    const onlineUsers = new Set(['u-khac']);
    expect(getEffectiveStatus('u1', 'online', onlineUsers)).toBe('offline');
  });

  test('trả về "offline" nếu userId có trong onlineUsers nhưng trạng thái thủ công là gì cũng bị BỎ QUA khi ngắt kết nối', () => {
    // Trường hợp quan trọng nhất: user chọn "Có mặt" trước khi tắt app -> vẫn phải hiện Ngoại tuyến
    const onlineUsers = new Set(); // rỗng = không ai đang kết nối
    expect(getEffectiveStatus('u1', 'online', onlineUsers)).toBe('offline');
  });

  test('trả về đúng trạng thái thủ công đã lưu nếu đang thực sự kết nối', () => {
    const onlineUsers = new Set(['u1']);
    expect(getEffectiveStatus('u1', 'online', onlineUsers)).toBe('online');
    expect(getEffectiveStatus('u1', 'idle', onlineUsers)).toBe('idle');
    expect(getEffectiveStatus('u1', 'away', onlineUsers)).toBe('away');
  });

  test('mặc định về "online" nếu đang kết nối nhưng chưa từng lưu trạng thái thủ công (user cũ trước khi có tính năng)', () => {
    const onlineUsers = new Set(['u1']);
    expect(getEffectiveStatus('u1', undefined, onlineUsers)).toBe('online');
    expect(getEffectiveStatus('u1', null, onlineUsers)).toBe('online');
  });

  test('mặc định về "online" nếu giá trị trạng thái lưu trong DB không hợp lệ/không nhận diện được', () => {
    const onlineUsers = new Set(['u1']);
    expect(getEffectiveStatus('u1', 'gia-tri-la', onlineUsers)).toBe('online');
  });

  test('không văng lỗi khi onlineUsers là undefined (component chưa kịp có SocketContext)', () => {
    expect(() => getEffectiveStatus('u1', 'online', undefined)).not.toThrow();
    expect(getEffectiveStatus('u1', 'online', undefined)).toBe('offline');
  });
});

describe('STATUS_META / STATUS_OPTIONS', () => {
  test('mỗi option trong STATUS_OPTIONS đều có metadata tương ứng trong STATUS_META', () => {
    STATUS_OPTIONS.forEach((opt) => {
      expect(STATUS_META[opt.value]).toBeDefined();
      expect(STATUS_META[opt.value].label).toBe(opt.label);
    });
  });

  test('STATUS_META có trạng thái "offline" dành riêng cho việc ngắt kết nối (không nằm trong STATUS_OPTIONS để chọn thủ công)', () => {
    expect(STATUS_META.offline).toBeDefined();
    expect(STATUS_OPTIONS.some((opt) => opt.value === 'offline')).toBe(false);
  });
});
