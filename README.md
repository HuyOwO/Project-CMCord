# CMCord 💬

Ứng dụng chat real-time lấy cảm hứng từ Discord, xây dựng dành riêng cho sinh viên CMC.

## Tính năng chính

- **Xác thực:** đăng ký / đăng nhập bằng JWT, mã hoá mật khẩu bằng bcrypt
- **Server (nhóm/lớp):** tạo server, mời qua invite code, rời server, xoá server (chỉ owner)
- **Phân quyền thành viên:** Owner / Moderator / Member, kick, ban/unban, đổi vai trò
- **Nickname riêng theo từng server** (khác với username toàn cục)
- **Channel:** tạo, đổi tên, xoá text channel
- **Nhắn tin real-time** qua Socket.io: gửi/nhận tức thì, typing indicator, gộp nhóm tin nhắn theo người gửi (kiểu Discord), phân chia theo ngày
- **Sửa / xoá tin nhắn** (tác giả sửa được tin của mình; Owner/Moderator có thể xoá tin của người khác theo quyền)
- **Đính kèm file** khi gửi tin nhắn (ảnh, PDF, DOC/DOCX, XLSX, ZIP — tối đa 25MB)

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Upload file | Multer |

## Cài đặt & Chạy

### Yêu cầu

- Node.js >= 18
- MongoDB đang chạy ở `localhost:27017`

### Bước 1 – Clone repo

```bash
git clone https://github.com/HuyOwO/BFH-Project-CMCord.git
cd BFH-Project-CMCord
```

### Bước 2 – Tạo file .env

```bash
cp server/.env.example server/.env
# Mở server/.env và điền JWT_SECRET
```

### Bước 3 – Tạo thư mục lưu file đính kèm

`server/uploads/` không được commit lên Git, cần tạo thủ công trước khi chạy lần đầu:

```bash
mkdir -p server/uploads
```

### Bước 4 – Cài dependencies & chạy

```bash
npm run install:all   # Cài tất cả packages
npm run dev           # Chạy cả frontend + backend
```

Frontend: <http://localhost:5173>
Backend API: <http://localhost:5000/api>

## Cấu trúc thư mục

```
cmcord/
├── client/                      # React frontend
│   └── src/
│       ├── pages/               # LoginPage, RegisterPage, HomePage, ChannelPage
│       ├── components/
│       │   ├── channel/         # ChannelSidebar, CreateChannelModal
│       │   ├── common/          # Modal
│       │   ├── layout/          # UserPanel
│       │   └── server/          # ServerSidebar, MemberListPanel, InviteModal, JoinServerModal,
│       │                        # NicknameModal, ServerSettingsModal
│       ├── context/              # AuthContext, SocketContext
│       ├── hooks/                # useAuth, useSocket, useServerSelect
│       ├── services/             # authService, serverService, channelService, messageService
│       └── utils/                # permissions.js (getRole, canDeleteMessage, canModerateMember...)
│
├── server/                       # Node.js backend
│   ├── scripts/
│   │   └── migrate-roles.js      # Script migrate dữ liệu role cũ
│   └── src/
│       ├── config/                # db.js (kết nối MongoDB)
│       ├── models/                # User, Server, Channel, Message
│       ├── controllers/           # auth, server, channel, message
│       ├── middleware/            # authMiddleware (verify JWT), uploadMiddleware (Multer)
│       ├── routes/                # REST API routes
│       └── socket/                # socketHandler.js
│
├── AGENTS.md                   # Hướng dẫn cho Codex agent
├── PRODUCT_VISION.md           # Product vision & mục tiêu dự án
├── PRODUCT_BACKLOG.md          # Backlog, MoSCoW, sprint planning
├── PERSONA_USER_JOURNEY.md     # Persona & user journey
├── SCENARIO_EPIC_USER_STORY.md # Scenario, epic, user story
└── package.json                 # Root scripts
```

## API Endpoints

### Auth

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Server

```
GET    /api/servers                          Danh sách server của user
POST   /api/servers                           Tạo server mới
POST   /api/servers/join                      Tham gia server bằng invite code
GET    /api/servers/:id                       Chi tiết server
PATCH  /api/servers/:id                       Cập nhật tên/mô tả server (owner)
DELETE /api/servers/:id                       Xoá server (owner)

PATCH  /api/servers/:id/nickname              Đổi nickname của bản thân trong server
DELETE /api/servers/:id/leave                 Rời server
PATCH  /api/servers/:id/members/:userId/role  Đổi vai trò thành viên (owner)
DELETE /api/servers/:id/members/:userId       Kick thành viên
POST   /api/servers/:id/bans/:userId          Ban thành viên
DELETE /api/servers/:id/bans/:userId          Unban thành viên
```

### Channel

```
GET    /api/servers/:serverId/channels           Danh sách channel
POST   /api/servers/:serverId/channels           Tạo channel mới
PATCH  /api/servers/:serverId/channels/:id       Đổi tên channel
DELETE /api/servers/:serverId/channels/:id       Xoá channel
```

### Message

```
GET    /api/channels/:channelId/messages   Lấy lịch sử tin nhắn (?page=&limit=)
POST   /api/channels/:channelId/messages   Gửi tin nhắn (hỗ trợ đính kèm file)
PATCH  /api/channels/messages/:id          Sửa tin nhắn (chỉ tác giả)
DELETE /api/channels/messages/:id          Xoá tin nhắn
```

## Socket.io Events

**Client → Server**

```
join_channel   { channelId }              Vào channel, subscribe tin nhắn
leave_channel  { channelId }              Rời channel
send_message   { channelId, content }     Gửi tin nhắn real-time
typing         { channelId }              Đang gõ...
stop_typing    { channelId }              Ngừng gõ
```

**Server → Client**

```
new_message       { message }                 Có tin nhắn mới
message_edited    { message }                 Tin nhắn vừa được sửa
message_deleted   { messageId, channelId }    Tin nhắn vừa bị xoá
user_typing       { userId, username }        Ai đó đang gõ
user_stop_typing  { userId }                  Người đó ngừng gõ
```

## Tài liệu dự án

| File | Nội dung |
|---|---|
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | Tầm nhìn sản phẩm, target user, success metrics |
| [PRODUCT_BACKLOG.md](./PRODUCT_BACKLOG.md) | Backlog đầy đủ theo MoSCoW và kế hoạch sprint |
| [PERSONA_USER_JOURNEY.md](./PERSONA_USER_JOURNEY.md) | Persona người dùng và user journey |
| [SCENARIO_EPIC_USER_STORY.md](./SCENARIO_EPIC_USER_STORY.md) | Scenario, epic và user story chi tiết |
| [AGENTS.md](./AGENTS.md) | Quy ước code & hướng dẫn cho Codex agent |

## Team

BFH Project – CMCord
Môn: Công Nghệ Phần Mềm – Khóa 4, Đại học CMC

<!-- TODO: điền tên + MSSV các thành viên nhóm -->
| Họ tên | MSSV | Vai trò |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
