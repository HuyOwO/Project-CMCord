# Bước 6 – Product Backlog & Feature Identification

## 📌 Quy ước:

### Độ ưu tiên (MoSCoW)
| Ký hiệu | Phân loại | Ý nghĩa |
|---|---|---|
| 🔴 **M** | Must Have | Bắt buộc có trong MVP |
| 🟡 **S** | Should Have | Nên có, ảnh hưởng trải nghiệm nhiều |
| 🟢 **C** | Could Have | Có thể thêm nếu còn thời gian |
| ⚫ **W** | Won't Have | Không làm trong giai đoạn này |

### Story Points (Fibonacci)
`1 – 2 – 3 – 5 – 8 – 13`  
*(1 = rất nhỏ, 13 = rất lớn/phức tạp)*

### Trạng thái (Status)
`📋 To Do` | `🔄 In Progress` | `✅ Done` | `🚫 Blocked`

---

## 🗂️ Product Backlog

### EPIC EP-01 – Xác thực người dùng

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-01-01 | Đăng ký tài khoản bằng email/mật khẩu | 🔴 M | 3 | Sprint 1 | 📋 To Do |
| US-01-02 | Đăng nhập tài khoản | 🔴 M | 2 | Sprint 1 | 📋 To Do |
| US-01-03 | Đăng xuất | 🔴 M | 1 | Sprint 1 | 📋 To Do |
| US-01-04 | Đổi mật khẩu | 🟡 S | 2 | Sprint 3 | 📋 To Do |
| US-01-05 | Quên mật khẩu (reset qua email) | 🟢 C | 3 | Sprint 4 | 📋 To Do |

---

### EPIC EP-02 – Quản lý Server

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-02-01 | Tạo server mới | 🔴 M | 3 | Sprint 1 | 📋 To Do |
| US-02-02 | Mời thành viên qua invite link | 🔴 M | 3 | Sprint 1 | 📋 To Do |
| US-02-03 | Rời khỏi server | 🟡 S | 2 | Sprint 2 | 📋 To Do |
| US-02-04 | Xóa server (chỉ Admin) | 🟡 S | 2 | Sprint 2 | 📋 To Do |
| US-02-05 | Chỉnh sửa thông tin server (tên, ảnh) | 🟢 C | 2 | Sprint 3 | 📋 To Do |
| US-02-06 | Phân quyền thành viên (Admin/Member) | 🟡 S | 3 | Sprint 2 | 📋 To Do |
| US-02-07 | Kick/Ban thành viên | 🟢 C | 2 | Sprint 3 | 📋 To Do |

---

### EPIC EP-03 – Quản lý Channel

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-03-01 | Tạo text channel | 🔴 M | 2 | Sprint 1 | 📋 To Do |
| US-03-02 | Xóa channel | 🟡 S | 1 | Sprint 2 | 📋 To Do |
| US-03-03 | Đổi tên channel | 🟢 C | 1 | Sprint 3 | 📋 To Do |
| US-03-04 | Sắp xếp channel theo thứ tự | 🟢 C | 2 | Sprint 4 | 📋 To Do |
| US-03-05 | Phân quyền xem/gửi tin nhắn theo channel | 🟢 C | 3 | Sprint 4 | 📋 To Do |

---

### EPIC EP-04 – Nhắn tin real-time

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-04-01 | Gửi/nhận tin nhắn text real-time | 🔴 M | 5 | Sprint 1 | 📋 To Do |
| US-04-02 | Xem lịch sử tin nhắn | 🔴 M | 3 | Sprint 2 | 📋 To Do |
| US-04-03 | @mention thành viên | 🟡 S | 3 | Sprint 2 | 📋 To Do |
| US-04-04 | Pin tin nhắn quan trọng | 🟡 S | 2 | Sprint 2 | 📋 To Do |
| US-04-05 | Xóa tin nhắn của mình | 🟡 S | 1 | Sprint 2 | 📋 To Do |
| US-04-06 | Chỉnh sửa tin nhắn đã gửi | 🟢 C | 2 | Sprint 3 | 📋 To Do |
| US-04-07 | React emoji vào tin nhắn | 🟢 C | 3 | Sprint 3 | 📋 To Do |
| US-04-08 | Reply (trả lời) một tin nhắn cụ thể | 🟢 C | 3 | Sprint 3 | 📋 To Do |
| US-04-09 | Gửi GIF / Sticker | ⚫ W | 5 | – | 📋 To Do |

---

### EPIC EP-05 – Chia sẻ tài liệu

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-05-01 | Upload file vào channel (PDF, DOCX, IMG, ZIP) | 🟡 S | 5 | Sprint 2 | 📋 To Do |
| US-05-02 | Preview ảnh trực tiếp trong chat | 🟡 S | 3 | Sprint 2 | 📋 To Do |
| US-05-03 | Download file đã upload | 🟡 S | 2 | Sprint 2 | 📋 To Do |
| US-05-04 | Xem danh sách tất cả file trong channel | 🟢 C | 3 | Sprint 3 | 📋 To Do |
| US-05-05 | Giới hạn dung lượng file upload | 🟡 S | 1 | Sprint 2 | 📋 To Do |

---

### EPIC EP-06 – Thông báo

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-06-01 | Badge đếm tin nhắn chưa đọc | 🟡 S | 3 | Sprint 2 | 📋 To Do |
| US-06-02 | Thông báo khi được @mention | 🟡 S | 3 | Sprint 3 | 📋 To Do |
| US-06-03 | Tắt/bật thông báo từng channel | 🟢 C | 2 | Sprint 3 | 📋 To Do |
| US-06-04 | Push notification (browser/app) | 🟢 C | 5 | Sprint 4 | 📋 To Do |

---

### EPIC EP-07 – Hồ sơ & Cài đặt

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-07-01 | Xem và chỉnh sửa hồ sơ cá nhân | 🟡 S | 2 | Sprint 3 | 📋 To Do |
| US-07-02 | Đổi avatar | 🟢 C | 2 | Sprint 3 | 📋 To Do |
| US-07-03 | Đặt trạng thái (Online/Away/Offline) | 🟢 C | 2 | Sprint 4 | 📋 To Do |

---

### EPIC EP-08 – Tìm kiếm (Post-MVP)

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-08-01 | Tìm kiếm tin nhắn theo từ khóa | ⚫ W | 8 | – | 📋 To Do |
| US-08-02 | Tìm kiếm file trong server | ⚫ W | 5 | – | 📋 To Do |
| US-08-03 | Tìm kiếm thành viên | ⚫ W | 3 | – | 📋 To Do |

---

## 📅 Kế hoạch Sprint (Sprint Planning Overview)

> Dự án thực hiện từ Tuần 5–8, mỗi Sprint = 1 tuần.

### Sprint 1 – Nền tảng (Foundation)
**Mục tiêu:** Người dùng có thể đăng ký, đăng nhập, tạo server, tạo channel và gửi tin nhắn cơ bản.

| ID | Mô tả | SP |
|---|---|---|
| US-01-01 | Đăng ký tài khoản | 3 |
| US-01-02 | Đăng nhập | 2 |
| US-01-03 | Đăng xuất | 1 |
| US-02-01 | Tạo server | 3 |
| US-02-02 | Mời thành viên qua link | 3 |
| US-03-01 | Tạo text channel | 2 |
| US-04-01 | Nhắn tin real-time | 5 |
| **Tổng** | | **19** |

---

### Sprint 2 – Cộng tác cơ bản (Core Collaboration)
**Mục tiêu:** Quản lý thành viên, chia sẻ file, xem lịch sử chat.

| ID | Mô tả | SP |
|---|---|---|
| US-02-03 | Rời server | 2 |
| US-02-04 | Xóa server | 2 |
| US-02-06 | Phân quyền Admin/Member | 3 |
| US-03-02 | Xóa channel | 1 |
| US-04-02 | Lịch sử tin nhắn | 3 |
| US-04-03 | @mention | 3 |
| US-04-04 | Pin tin nhắn | 2 |
| US-04-05 | Xóa tin nhắn | 1 |
| US-05-01 | Upload file | 5 |
| US-05-02 | Preview ảnh | 3 |
| US-05-03 | Download file | 2 |
| US-05-05 | Giới hạn dung lượng | 1 |
| US-06-01 | Badge unread count | 3 |
| **Tổng** | | **31** |

---

### Sprint 3 – Trải nghiệm nâng cao (Enhanced UX)
**Mục tiêu:** Thông báo, hồ sơ, tính năng tương tác phong phú hơn.

| ID | Mô tả | SP |
|---|---|---|
| US-01-04 | Đổi mật khẩu | 2 |
| US-02-05 | Chỉnh sửa thông tin server | 2 |
| US-02-07 | Kick/Ban thành viên | 2 |
| US-03-03 | Đổi tên channel | 1 |
| US-04-06 | Chỉnh sửa tin nhắn | 2 |
| US-04-07 | React emoji | 3 |
| US-04-08 | Reply tin nhắn | 3 |
| US-05-04 | Danh sách file trong channel | 3 |
| US-06-02 | Thông báo @mention | 3 |
| US-06-03 | Tắt/bật thông báo | 2 |
| US-07-01 | Hồ sơ cá nhân | 2 |
| US-07-02 | Đổi avatar | 2 |
| **Tổng** | | **27** |

---

### Sprint 4 – Hoàn thiện & Buffer (Polish)
**Mục tiêu:** Sửa lỗi, cải thiện UI, tính năng nhỏ còn lại.

| ID | Mô tả | SP |
|---|---|---|
| US-01-05 | Quên mật khẩu | 3 |
| US-03-04 | Sắp xếp channel | 2 |
| US-03-05 | Phân quyền channel | 3 |
| US-06-04 | Push notification | 5 |
| US-07-03 | Trạng thái Online/Away | 2 |
| Bug fixes & UI polish | – | 5 |
| **Tổng** | | **20** |

---

## 🎯 Feature Identification

### Tính năng cốt lõi (Core Features – MVP)

```
CMCord MVP Feature Set
├── 🔐 Authentication
│   ├── Đăng ký / Đăng nhập / Đăng xuất
│   └── Phiên đăng nhập bền vững (persistent session)
│
├── 🏠 Server Management
│   ├── Tạo Server
│   ├── Invite Link
│   └── Phân quyền Admin / Member
│
├── 📢 Channel Management
│   ├── Tạo Text Channel
│   └── Danh sách Channel trong Sidebar
│
├── 💬 Real-time Messaging
│   ├── Gửi / Nhận tin nhắn (WebSocket)
│   ├── Lịch sử tin nhắn
│   ├── @mention
│   └── Pin tin nhắn
│
└── 📎 File Sharing
    ├── Upload file (≤25MB)
    ├── Image preview
    └── File download
```

### Tính năng bổ sung (Enhanced Features – Should/Could Have)

```
Enhanced Features
├── 🔔 Notifications
│   ├── Unread badge
│   └── @mention alert
│
├── 😄 Rich Messaging
│   ├── Emoji react
│   ├── Reply to message
│   └── Edit / Delete message
│
├── 👤 Profile
│   ├── Hồ sơ cá nhân
│   └── Đổi avatar
│
└── ⚙️ Settings
    ├── Đổi mật khẩu
    └── Tắt thông báo
```

### Tính năng tương lai (Future Features – Won't Have / Post-MVP)

```
Post-MVP Roadmap
├── 🔍 Search (tin nhắn, file, thành viên)
├── 🎙️ Voice / Video Channel
├── 🤖 Bot tích hợp (deadline reminder, poll...)
├── 📱 Mobile App (React Native)
└── 🔗 LMS Integration (Moodle, Google Classroom)
```

---

## 📊 Tổng kết Backlog

| Phân loại | Số items | Tổng SP |
|---|---|---|
| 🔴 Must Have | 11 | 34 |
| 🟡 Should Have | 16 | 40 |
| 🟢 Could Have | 14 | 38 |
| ⚫ Won't Have | 5 | 21 |
| **Tổng** | **46** | **133** |

> **Sprint capacity ước tính:** ~20–30 SP / Sprint × 4 Sprint = **80–97 SP**  
> → Toàn bộ Must Have và hầu hết Should Have sẽ được hoàn thành trong 4 Sprint.

---

*Tài liệu thuộc Tuần 3 – Dự án CMCord*  
