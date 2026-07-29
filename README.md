# CMCord 💬

Ứng dụng chat real-time học thuật lấy cảm hứng từ Discord, đang mở rộng thêm hệ thống học tập (Learning System) cho sinh viên và giảng viên.

## ✨ Tính năng chính

- **Auth**: đăng ký / đăng nhập bằng JWT, đổi mật khẩu
- **Server & Channel**: tạo/tham gia server qua mã mời, quản lý channel, phân quyền owner/moderator/member, kick/ban
- **Nhắn tin real-time**: gửi tin nhắn tức thì qua Socket.io, typing indicator, reply, pin, reaction (emoji), sửa/xoá tin nhắn
- **Tìm kiếm**: tìm tin nhắn, file đính kèm, thành viên trong phạm vi 1 server (`Ctrl/Cmd+K`)
- **Tin nhắn riêng (Direct Message)**: nhắn 1-1 với người chung server hoặc bạn bè, real-time, đính kèm file, reaction, sửa/xoá
- **Bạn bè**: gửi/nhận lời mời kết bạn theo username, chấp nhận/từ chối, danh sách bạn bè kèm trạng thái online, nhắn tin trực tiếp không cần chung server
- **Chia sẻ file**: đính kèm file tối đa **8MB**/tin nhắn; lưu trên đĩa cục bộ khi chạy dev, tự chuyển sang **Cloudinary** (free) khi deploy thật
<<<<<<< HEAD
=======
- **🎓 Learning System (Milestone 2 – MỚI)**: mỗi server có thể có nhiều khoá học (Course) riêng, join bằng mã mời riêng của khoá học; vai trò Instructor / TA / Student; đăng tài liệu bài học (Lesson) theo thứ tự; giao bài tập (Assignment) có deadline + file đính kèm; sinh viên nộp bài (Submission, hỗ trợ nộp lại); giảng viên/TA chấm điểm (thang 10) kèm nhận xét, sinh viên nhận thông báo real-time (toast) ngay khi có điểm mới hoặc bài tập sắp đến hạn (nhắc tự động trước 24h); bảng điểm tổng hợp (Gradebook) cho instructor/TA
>>>>>>> milestone2-import

## Tech Stack

| Layer     | Công nghệ                                     |
| --------- | --------------------------------------------- |
| Frontend  | React 18, React Router v6, Tailwind CSS, Vite |
| Backend   | Node.js, Express.js                           |
| Real-time | Socket.io                                     |
| Database  | MongoDB + Mongoose                            |
| Auth      | JWT + bcrypt                                  |
| File lưu trữ | Đĩa cục bộ (dev) hoặc Cloudinary (production, free) |

## 🗺️ Roadmap

| Milestone | Nội dung | Trạng thái |
| --- | --- | --- |
| **1 – Chat MVP** | Auth, Server/Channel, nhắn tin real-time, tìm kiếm, tin nhắn riêng (DM), bạn bè, chia sẻ file | ✅ Hoàn thành |
<<<<<<< HEAD
| **2 – Learning System** | Course & Enrollment, Lesson, Assignment & Submission, Grading | ⏳ Chưa bắt đầu |
=======
| **2 – Learning System** | Course & Enrollment, Lesson, Assignment & Submission, Grading, thông báo real-time, nhắc deadline tự động, Gradebook | ✅ Hoàn thành |

Ghi chú: sắp xếp lại thứ tự bài học dùng nút lên/xuống thay vì kéo-thả (đủ dùng, chắc chắn hoạt động trên mọi thiết bị).
>>>>>>> milestone2-import

> Chi tiết phạm vi từng milestone xem tại [`PRODUCT_VISION.md`](./PRODUCT_VISION.md).

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- MongoDB đang chạy ở localhost:27017

### Bước 1 – Clone repo

```
git clone https://github.com/HuyOwO/Project-CMCord.git
cd Project-CMCord
```

### Bước 2 – Tạo file .env

```
cp server/.env.example server/.env
# Mở server/.env và điền JWT_SECRET
```

Mặc định file đính kèm sẽ lưu ở `server/uploads/` (đủ dùng khi chạy local). Nếu deploy thật, điền thêm 3 biến `CLOUDINARY_*` trong `.env` (xem hướng dẫn ngay trong `server/.env.example`) để file không bị mất khi hosting redeploy.

### Bước 3 – Cài dependencies & chạy

```
npm run install:all   # Cài tất cả packages
npm run dev           # Chạy cả frontend + backend
```

Frontend: <http://localhost:5173>
Backend API: <http://localhost:5000/api>

## Cấu trúc thư mục

```
cmcord/
├── client/          # React frontend
│   └── src/
<<<<<<< HEAD
│       ├── pages/       # LoginPage, RegisterPage, HomePage, ChannelPage, DMPage
=======
│       ├── pages/       # LoginPage, RegisterPage, HomePage, ChannelPage, DMPage, CoursesPage, CourseDetailPage
>>>>>>> milestone2-import
│       ├── components/
│       │   ├── server/    # ServerSidebar, MemberListPanel, SearchModal, các modal server
│       │   ├── channel/   # ChannelSidebar, CreateChannelModal
│       │   ├── dm/        # DMSidebar, FriendsPanel, NewDMModal
<<<<<<< HEAD
=======
│       │   ├── course/    # Learning System: CourseListSidebar, LessonList, AssignmentList, GradingPanel...
>>>>>>> milestone2-import
│       │   ├── layout/    # UserPanel
│       │   └── common/    # Modal dùng chung
│       ├── context/     # AuthContext, SocketContext
│       ├── hooks/       # useAuth, useSocket, useServerSelect
<<<<<<< HEAD
│       └── services/    # API calls (auth, server, channel, message, dm, friend, search)
├── server/          # Node.js backend
│   └── src/
│       ├── models/      # User, Server, Channel, Message, Conversation, DirectMessage, Friendship
│       ├── controllers/ # auth, server, channel, message, dm, friend, search, user
│       ├── routes/      # REST API routes
│       ├── socket/      # Socket.io handler (channel, DM, typing, presence, friend notification)
=======
│       └── services/    # API calls (auth, server, channel, message, dm, friend, search, course, lesson, assignment, submission)
├── server/          # Node.js backend
│   └── src/
│       ├── models/      # User, Server, Channel, Message, Conversation, DirectMessage, Friendship, Course, Lesson, Assignment, Submission
│       ├── controllers/ # auth, server, channel, message, dm, friend, search, user, course, lesson, assignment, submission
│       ├── routes/      # REST API routes
│       ├── socket/      # Socket.io handler (channel, DM, typing, presence, friend notification, grade notification)
>>>>>>> milestone2-import
│       └── config/      # DB connection, Cloudinary config
├── AGENTS.md        # Hướng dẫn cho Codex agent
└── package.json     # Root scripts
```

## API Endpoints

```
# Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/password

# Server
GET    /api/servers
POST   /api/servers
POST   /api/servers/join
GET    /api/servers/:id
PATCH  /api/servers/:id
DELETE /api/servers/:id
GET    /api/servers/:id/search              # tìm tin nhắn / file / thành viên trong server
PATCH  /api/servers/:id/nickname
DELETE /api/servers/:id/leave
PATCH  /api/servers/:id/members/:userId/role
DELETE /api/servers/:id/members/:userId
POST   /api/servers/:id/bans/:userId
DELETE /api/servers/:id/bans/:userId

# Channel
GET    /api/servers/:serverId/channels
POST   /api/servers/:serverId/channels
PATCH  /api/servers/:serverId/channels/:id
DELETE /api/servers/:serverId/channels/:id

# Tin nhắn trong channel
GET    /api/channels/:channelId/messages
POST   /api/channels/:channelId/messages     # multipart, hỗ trợ đính kèm file
PATCH  /api/channels/messages/:id
DELETE /api/channels/messages/:id
PATCH  /api/channels/messages/:id/pin
POST   /api/channels/messages/:id/react

# Direct Message
GET    /api/dm/contacts                      # người có thể nhắn tin (bạn bè / chung server)
GET    /api/dm                               # danh sách hội thoại
POST   /api/dm                               # lấy/tạo hội thoại với 1 user
GET    /api/dm/:conversationId/messages
POST   /api/dm/:conversationId/messages      # multipart, hỗ trợ đính kèm file
PATCH  /api/dm/messages/:id
DELETE /api/dm/messages/:id
POST   /api/dm/messages/:id/react

# Bạn bè
GET    /api/friends                          # bạn bè + lời mời đến + lời mời đi
POST   /api/friends/requests                 # gửi lời mời theo username
POST   /api/friends/requests/:id/accept
DELETE /api/friends/:id                      # từ chối / huỷ lời mời / huỷ kết bạn

# User
PATCH  /api/users/me
<<<<<<< HEAD
```

=======

# Learning System (Milestone 2)
GET    /api/servers/:serverId/courses           # danh sách khoá học trong 1 server
POST   /api/servers/:serverId/courses           # tạo khoá học (owner/moderator server), người tạo tự thành instructor
GET    /api/courses/:id
PATCH  /api/courses/:id                         # instructor
DELETE /api/courses/:id                         # instructor, xoá kèm lesson/assignment/submission
POST   /api/courses/join                        # enroll bằng mã mời riêng của course -> role student
PATCH  /api/courses/:id/members/:userId/role    # instructor đổi role ta/student
DELETE /api/courses/:id/members/:userId         # instructor xoá thành viên khỏi course
GET    /api/courses/:id/gradebook               # instructor/TA: bảng điểm tổng hợp toàn bộ course

GET    /api/courses/:courseId/lessons
POST   /api/courses/:courseId/lessons           # instructor/TA, multipart, hỗ trợ file đính kèm
PATCH  /api/lessons/:id                         # instructor/TA
PATCH  /api/lessons/:id/reorder                 # instructor/TA, đổi thứ tự hiển thị
DELETE /api/lessons/:id                         # instructor/TA

GET    /api/courses/:courseId/assignments
POST   /api/courses/:courseId/assignments       # instructor/TA, multipart, deadline tuỳ chọn
GET    /api/assignments/:id
PATCH  /api/assignments/:id                     # instructor/TA
DELETE /api/assignments/:id                     # instructor/TA, xoá kèm submission liên quan

GET    /api/assignments/:id/submissions         # instructor/TA: tất cả; student: chỉ bài của mình
POST   /api/assignments/:id/submissions         # student nộp/nộp lại, multipart
PATCH  /api/submissions/:id/grade               # instructor/TA chấm điểm (0-10) + nhận xét, bắn socket 'grade_posted'
```

## Socket.io Events (bổ sung Milestone 2)

```
grade_posted       { submissionId, assignmentId, assignmentTitle, courseId, courseName, score, feedback }
deadline_reminder  { assignmentId, assignmentTitle, courseId, courseName, deadline }
```
Cả 2 sự kiện phát tới phòng riêng `user:<studentId>` (cùng cơ chế với thông báo lời mời kết bạn):
- `grade_posted`: ngay khi instructor/TA chấm điểm một bài nộp.
- `deadline_reminder`: tự động, do `server/src/jobs/deadlineReminderJob.js` quét mỗi 15 phút, báo trước 24h cho sinh viên CHƯA nộp bài (không báo lại 2 lần cho cùng 1 assignment).

Frontend hiển thị cả 2 sự kiện dưới dạng toast toàn cục (`client/src/components/common/NotificationToastHost.jsx`, mount ở `App.jsx`) — hoạt động ở bất kỳ trang nào, không cần đang mở đúng course đó. Bấm vào toast sẽ điều hướng qua route ngắn `/courses/:courseId` để tự tra ra đúng server rồi mở khoá học.

>>>>>>> milestone2-import
## Team

BFH Project – CMCord
Môn: Phát triển ứng dụng / Dự án phần mềm

## About

Bài tập lớn môn Công Nghệ Phần Mềm (khóa 4 trường Đại học CMC).
