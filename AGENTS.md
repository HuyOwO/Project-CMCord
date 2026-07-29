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
│   │   │   ├── course/            # Learning System (Milestone 2)
│   │   │   └── message/           # MessageList, MessageInput, MessageItem...
│   │   ├── pages/                 # Route-level pages
│   │   ├── context/               # React Context (AuthContext, SocketContext)
│   │   ├── hooks/                 # Custom hooks (useAuth, useSocket, useServerSelect)
│   │   ├── services/              # API calls (auth, server, channel, message, course...)
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
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/
│   │   ├── models/                # Mongoose schemas (bao gồm Course, Lesson, Assignment, Submission)
│   │   ├── routes/
│   │   ├── socket/                # Socket.io handler
│   │   └── app.js
│   ├── index.js                   # Entry point
│   └── package.json
│
└── package.json                   # Root: scripts dùng concurrently
```

---

## ⚙️ Lệnh chạy dự án

```bash
npm run install:all
npm run dev
npm run server
npm run client
npm test
```

> **Lưu ý:** Backend chạy ở port **5000**, frontend chạy ở port **5173** (Vite default).

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
  res.status(200).json({ success: true, data: ... })
  res.status(400).json({ success: false, message: '...' })
  ```
- Biến môi trường đọc từ `.env`, không hardcode

### Frontend (React)
- Dùng **functional component** + hooks, không dùng class component
- Mỗi component một file, đặt trong đúng thư mục (`components/`, `pages/`)
- State toàn cục dùng **React Context**, không Redux (MVP)
- API calls đặt trong `services/`, không gọi Axios trực tiếp trong component
- Tên file component: **PascalCase**, tên file khác: **camelCase**

---

## 🔐 Môi trường (Environment Variables)

File `.env` đặt trong `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cmcord
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

---

## ✅ Quy tắc khi làm task

1. **Làm đúng phạm vi task** — không tự thêm feature ngoài yêu cầu
2. **Chạy `npm test` sau mỗi thay đổi** nếu có file test liên quan
3. **Không tự ý thêm package mới** — hỏi nhóm trước
4. **Không xóa code cũ** nếu chưa chắc — dùng comment `// TODO: remove` thay thế
5. **Commit message** theo format: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`

---

*Cập nhật lần cuối: Milestone 2 – Learning System*
