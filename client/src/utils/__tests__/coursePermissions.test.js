import { describe, test, expect } from 'vitest';
import { getCourseRole, canManageCourse, isCourseInstructor } from '../coursePermissions';

describe('getCourseRole', () => {
  const course = {
    members: [
      { user: 'u-instructor', role: 'instructor' },
      { user: { _id: 'u-ta' }, role: 'ta' },
      { user: 'u-student', role: 'student' },
    ],
  };

  test('trả về null nếu thiếu course hoặc thiếu userId', () => {
    expect(getCourseRole(null, 'u-student')).toBeNull();
    expect(getCourseRole(course, null)).toBeNull();
  });

  test('trả về đúng role của từng thành viên, hỗ trợ cả user populate và raw id', () => {
    expect(getCourseRole(course, 'u-instructor')).toBe('instructor');
    expect(getCourseRole(course, 'u-ta')).toBe('ta');
    expect(getCourseRole(course, 'u-student')).toBe('student');
  });

  test('trả về null nếu user chưa enroll vào course', () => {
    expect(getCourseRole(course, 'u-la')).toBeNull();
  });
});

describe('canManageCourse', () => {
  test('instructor và ta được quản lý nội dung course', () => {
    expect(canManageCourse('instructor')).toBe(true);
    expect(canManageCourse('ta')).toBe(true);
  });

  test('student và null không được quản lý nội dung course', () => {
    expect(canManageCourse('student')).toBe(false);
    expect(canManageCourse(null)).toBe(false);
  });
});

describe('isCourseInstructor', () => {
  test('chỉ instructor mới có quyền cấp cao nhất', () => {
    expect(isCourseInstructor('instructor')).toBe(true);
    expect(isCourseInstructor('ta')).toBe(false);
    expect(isCourseInstructor('student')).toBe(false);
  });
});
