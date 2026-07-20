# CMCord 💬

Ứng dụng chat real-time lấy cảm hứng từ Discord

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |

## Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- MongoDB đang chạy ở localhost:27017

### Bước 1 – Clone repo
```bash
git clone https://github.com/<your-org>/Project-CMCord.git
cd BFH-Project-CMCord
```

### Bước 2 – Tạo file .env
```bash
cp server/.env.example server/.env
# Mở server/.env và điền JWT_SECRET
```

### Bước 3 – Cài dependencies & chạy
```bash
npm run install:all   # Cài tất cả packages
npm run dev           # Chạy cả frontend + backend
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

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
│       ├── controllers/ # auth, server, channel, message
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

## Team

BFH Project – CMCord  
Môn: Phát triển ứng dụng / Dự án phần mềm
