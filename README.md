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
| **2 – Learning System** | Course & Enrollment, Lesson, Assignment & Submission, Grading | ⏳ Chưa bắt đầu |

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
│       ├── pages/       # LoginPage, RegisterPage, HomePage, ChannelPage, DMPage
│       ├── components/
│       │   ├── server/    # ServerSidebar, MemberListPanel, SearchModal, các modal server
│       │   ├── channel/   # ChannelSidebar, CreateChannelModal
│       │   ├── dm/        # DMSidebar, FriendsPanel, NewDMModal
│       │   ├── layout/    # UserPanel
│       │   └── common/    # Modal dùng chung
│       ├── context/     # AuthContext, SocketContext
│       ├── hooks/       # useAuth, useSocket, useServerSelect
│       └── services/    # API calls (auth, server, channel, message, dm, friend, search)
├── server/          # Node.js backend
│   └── src/
│       ├── models/      # User, Server, Channel, Message, Conversation, DirectMessage, Friendship
│       ├── controllers/ # auth, server, channel, message, dm, friend, search, user
│       ├── routes/      # REST API routes
│       ├── socket/      # Socket.io handler (channel, DM, typing, presence, friend notification)
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
```

## Team

BFH Project – CMCord
Môn: Phát triển ứng dụng / Dự án phần mềm

## About

Bài tập lớn môn Công Nghệ Phần Mềm (khóa 4 trường Đại học CMC).
