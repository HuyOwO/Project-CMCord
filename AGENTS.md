# CMCord – AGENTS.md

> Đây là file hướng dẫn dành cho Codex agent. Đọc toàn bộ trước khi bắt đầu bất kỳ task nào.

---

## 📌 Giới thiệu dự án

**CMCord** là ứng dụng chat real-time lấy cảm hứng từ Discord, xây dựng dành riêng cho sinh viên.  
Người dùng có thể tạo **Server** (nhóm/lớp), tạo **Channel** theo chủ đề, nhắn tin real-time, và chia sẻ tài liệu.

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Token) + bcrypt |
| File upload | Multer |
| HTTP Client | Axios |
| Dev tools | Nodemon, dotenv, concurrently |

---

## 📁 Cấu trúc thư mục

```
cmcord/
├── AGENTS.md
├── README.md
├── .gitignore
│
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── common/            # Button, Input, Modal, Avatar...
│   │   │   ├── layout/            # Sidebar, Header, Layout...
│   │   │   ├── server/            # ServerList, ServerCard...
│   │   │   ├── channel/           # ChannelList, ChannelItem...
│   │   │   └── message/           # MessageList, MessageInput, MessageItem...
│   │   ├── pages/                 # Route-level pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── HomePage.jsx       # Màn hình chính sau đăng nhập
│   │   │   └── ChannelPage.jsx    # Màn hình chat trong channel
│   │   ├── context/               # React Context (AuthContext, SocketContext)
│   │   ├── hooks/                 # Custom hooks (useAuth, useSocket, useMessages)
│   │   ├── services/              # API calls (authService, serverService...)
│   │   ├── socket/                # Socket.io client setup
│   │   ├── utils/                 # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                        # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/           # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── serverController.js
│   │   │   ├── channelController.js
│   │   │   └── messageController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verification
│   │   │   └── uploadMiddleware.js
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Server.js
│   │   │   ├── Channel.js
│   │   │   └── Message.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── serverRoutes.js
│   │   │   ├── channelRoutes.js
│   │   │   └── messageRoutes.js
│   │   ├── socket/
│   │   │   └── socketHandler.js   # Socket.io event handlers
│   │   └── app.js
│   ├── index.js                   # Entry point
│   └── package.json
│
└── package.json                   # Root: scripts dùng concurrently
```

---

## ⚙️ Lệnh chạy dự án

```bash
# Cài dependencies (chạy từ root)
npm run install:all

# Chạy cả frontend + backend cùng lúc (development)
npm run dev

# Chỉ chạy backend
npm run server

# Chỉ chạy frontend
npm run client

# Chạy test
npm test
```

> **Lưu ý:** Backend chạy ở port **5000**, frontend chạy ở port **5173** (Vite default).

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register       Đăng ký tài khoản
POST   /api/auth/login          Đăng nhập
GET    /api/auth/me             Lấy thông tin user hiện tại (cần JWT)
```

### Server (Nhóm/Lớp)
```
GET    /api/servers             Lấy danh sách server của user
POST   /api/servers             Tạo server mới
GET    /api/servers/:id         Lấy chi tiết server
PUT    /api/servers/:id         Cập nhật server (chỉ Admin)
DELETE /api/servers/:id         Xóa server (chỉ Admin)
POST   /api/servers/:id/invite  Tạo invite link
POST   /api/servers/join        Tham gia server qua invite link
```

### Channel
```
GET    /api/servers/:serverId/channels          Lấy danh sách channel
POST   /api/servers/:serverId/channels          Tạo channel mới (Admin)
DELETE /api/servers/:serverId/channels/:id      Xóa channel (Admin)
```

### Message
```
GET    /api/channels/:channelId/messages        Lấy lịch sử tin nhắn (phân trang)
POST   /api/channels/:channelId/messages        Gửi tin nhắn (REST fallback)
DELETE /api/messages/:id                        Xóa tin nhắn
```

---

## 🔌 Socket.io Events

### Client → Server (emit)
```
join_channel     { channelId }              Vào channel, subscribe tin nhắn
leave_channel    { channelId }              Rời channel
send_message     { channelId, content }     Gửi tin nhắn
typing           { channelId }              Đang gõ...
stop_typing      { channelId }              Ngừng gõ
```

### Server → Client (on)
```
new_message      { message }               Có tin nhắn mới
user_typing      { userId, username }      Ai đó đang gõ
user_stop_typing { userId }                Ngừng gõ
user_joined      { userId, username }      Thành viên vào channel
user_left        { userId }                Thành viên rời channel
```

---

## 🗄️ Data Models (Mongoose)

### User
```js
{
  username:    String (required, unique),
  email:       String (required, unique),
  password:    String (hashed, required),
  avatar:      String (URL, default: null),
  createdAt:   Date
}
```

### Server
```js
{
  name:        String (required),
  description: String,
  avatar:      String (URL),
  owner:       ObjectId (ref: User),
  members:     [{ user: ObjectId, role: 'admin'|'member' }],
  inviteCode:  String (unique),
  createdAt:   Date
}
```

### Channel
```js
{
  name:        String (required),
  server:      ObjectId (ref: Server),
  type:        String (enum: ['text'], default: 'text'),
  createdAt:   Date
}
```

### Message
```js
{
  content:     String,
  author:      ObjectId (ref: User),
  channel:     ObjectId (ref: Channel),
  fileUrl:     String (null nếu không có file),
  fileType:    String,
  createdAt:   Date,
  updatedAt:   Date,
  isEdited:    Boolean (default: false)
}
```

---

## 📋 Coding Conventions

### Chung
- Ngôn ngữ code: **Tiếng Anh** (tên biến, hàm, comment)
- Không dùng `var`, chỉ dùng `const` và `let`
- Dùng **async/await**, không dùng `.then().catch()` chain dài
- Xử lý lỗi bằng `try/catch`, luôn có message lỗi rõ ràng

### Backend (Node.js)
- Mỗi route chỉ gọi controller, không chứa logic
- Middleware xác thực JWT đặt trong `authMiddleware.js`, dùng lại cho tất cả protected routes
- Response format thống nhất:
  ```js
  // Thành công
  res.status(200).json({ success: true, data: ... })

  // Lỗi
  res.status(400).json({ success: false, message: '...' })
  ```
- Biến môi trường đọc từ `.env`, không hardcode

### Frontend (React)
- Dùng **functional component** + hooks, không dùng class component
- Mỗi component một file, đặt trong đúng thư mục (`components/`, `pages/`)
- State toàn cục dùng **React Context**, không Redux (MVP)
- API calls đặt trong `services/`, không gọi Axios trực tiếp trong component
- Tên file component: **PascalCase** (vd: `MessageList.jsx`)
- Tên file khác: **camelCase** (vd: `authService.js`)

---

## 🔐 Môi trường (Environment Variables)

File `.env` đặt trong `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cmcord
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

> **.env không được commit lên GitHub.** Đã có trong `.gitignore`.

---

## ✅ Quy tắc khi làm task

1. **Làm đúng phạm vi task** — không tự thêm feature ngoài yêu cầu
2. **Chạy `npm test` sau mỗi thay đổi** nếu có file test liên quan
3. **Không tự ý thêm package mới** — hỏi nhóm trước
4. **Không xóa code cũ** nếu chưa chắc — dùng comment `// TODO: remove` thay thế
5. **Commit message** theo format: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`

---

## 🚫 Những điều KHÔNG làm

- Không dùng `console.log` trong production code (dùng trong dev thì OK, có comment)
- Không lưu password dạng plain text — luôn dùng `bcrypt.hash()`
- Không trả về toàn bộ object User (có password) trong response API
- Không đặt logic phức tạp trực tiếp trong `index.js` hay `App.jsx`
- Không dùng `any` nếu sau này chuyển sang TypeScript

---

*Cập nhật lần cuối: Tuần 3 – Dự án CMCord*
