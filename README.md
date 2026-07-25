# CMCord 💬

Ứng dụng chat real-time học thuật lấy cảm hứng từ Discord, đang mở rộng thêm hệ thống học tập (Learning System) cho sinh viên và giảng viên.

## Tech Stack

| Layer     | Công nghệ                                     |
| --------- | --------------------------------------------- |
| Frontend  | React 18, React Router v6, Tailwind CSS, Vite |
| Backend   | Node.js, Express.js                           |
| Real-time | Socket.io                                     |
| Database  | MongoDB + Mongoose                            |
| Auth      | JWT + bcrypt                                  |

## 🗺️ Roadmap

| Milestone | Nội dung | Trạng thái |
| --- | --- | --- |
| **1 – Chat MVP** | Auth, Server/Channel, nhắn tin real-time, chia sẻ file | ✅ Hoàn thành |
| **2 – Learning System** | Course & Enrollment, Lesson, Assignment & Submission, Grading | 🔄 Đang phát triển |

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- MongoDB đang chạy ở localhost:27017

### Bước 1 – Clone repo

```
git clone https://github.com/<your-org>/Project-CMCord.git
cd BFH-Project-CMCord
```

### Bước 2 – Tạo file .env

```
cp server/.env.example server/.env
# Mở server/.env và điền JWT_SECRET
```

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
│       ├── pages/       # LoginPage, RegisterPage, HomePage, ChannelPage
│       ├── context/     # AuthContext, SocketContext
│       ├── hooks/       # useAuth, useSocket
│       └── services/    # API calls
├── server/          # Node.js backend
│   └── src/
│       ├── models/      # User, Server, Channel, Message
│       │                # + Course, Lesson, Assignment, Submission, Grade (Milestone 2)
│       ├── controllers/ # auth, server, channel, message
│       │                # + course, lesson, assignment, submission (Milestone 2)
│       ├── routes/      # REST API routes
│       └── socket/      # Socket.io handler
├── AGENTS.md        # Hướng dẫn cho Codex agent
└── package.json     # Root scripts
```

## API Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/servers
POST   /api/servers
POST   /api/servers/join
GET    /api/servers/:id
DELETE /api/servers/:id

GET    /api/servers/:id/channels
POST   /api/servers/:id/channels
DELETE /api/servers/:id/channels/:channelId

GET    /api/channels/:id/messages
POST   /api/channels/:id/messages
DELETE /api/channels/messages/:id
```

## API Endpoints – Learning System (Milestone 2, đang phát triển)

```
GET    /api/courses
POST   /api/courses
POST   /api/courses/join
GET    /api/courses/:id

GET    /api/courses/:id/lessons
POST   /api/courses/:id/lessons

GET    /api/courses/:id/assignments
POST   /api/courses/:id/assignments

POST   /api/assignments/:id/submissions
GET    /api/assignments/:id/submissions

PATCH  /api/submissions/:id/grade
```

## Team

BFH Project – CMCord
Môn: Phát triển ứng dụng / Dự án phần mềm

## About

Bài tập lớn môn Công Nghệ Phần Mềm (khóa 4 trường Đại học CMC).
