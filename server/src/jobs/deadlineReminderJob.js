const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000; // nhắc khi deadline còn trong vòng 24h tới
const CHECK_INTERVAL_MS = 15 * 60 * 1000;        // quét lại mỗi 15 phút

// Milestone 2 – "Nhắc deadline tự động": quét các Assignment có deadline rơi vào
// trong 24h tới mà CHƯA gửi nhắc (remindersSent=false), báo cho từng sinh viên
// trong course (trừ người đã nộp bài) qua đúng phòng riêng `user:<id>` đã dùng
// sẵn cho thông báo lời mời kết bạn & điểm bài tập (xem socketHandler.js).
const checkDeadlines = async (io) => {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

    const dueAssignments = await Assignment.find({
      deadline: { $gte: now, $lte: windowEnd },
      remindersSent: false,
    });

    for (const assignment of dueAssignments) {
      const course = await Course.findById(assignment.course);
      if (!course) continue;

      const submitted = await Submission.find({ assignment: assignment._id }).select('student');
      const submittedIds = new Set(submitted.map((s) => s.student.toString()));

      const students = course.members.filter((m) => m.role === 'student');
      students.forEach((m) => {
        const uid = (m.user._id || m.user).toString();
        if (submittedIds.has(uid)) return; // đã nộp rồi -> không cần nhắc

        io.to(`user:${uid}`).emit('deadline_reminder', {
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          courseId: assignment.course,
          courseName: course.name,
          deadline: assignment.deadline,
        });
      });

      assignment.remindersSent = true;
      await assignment.save();
    }
  } catch (err) {
    console.error('Deadline reminder job error:', err.message);
  }
};

// Chạy 1 lần ngay lúc khởi động server, sau đó lặp lại mỗi CHECK_INTERVAL_MS.
// Trả về interval handle để index.js có thể clearInterval khi cần (vd trong test).
const startDeadlineReminderJob = (io) => {
  checkDeadlines(io);
  return setInterval(() => checkDeadlines(io), CHECK_INTERVAL_MS);
};

module.exports = { startDeadlineReminderJob, checkDeadlines };
