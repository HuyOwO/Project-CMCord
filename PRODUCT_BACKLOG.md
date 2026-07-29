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
| US-01-01 | Đăng ký tài khoản bằng email/mật khẩu | 🔴 M | 3 | Sprint 1 | ✅ Done |
| US-01-02 | Đăng nhập tài khoản | 🔴 M | 2 | Sprint 1 | ✅ Done |
| US-01-03 | Đăng xuất | 🔴 M | 1 | Sprint 1 | ✅ Done |
| US-01-04 | Đổi mật khẩu | 🟡 S | 2 | Sprint 3 | ✅ Done |
| US-01-05 | Quên mật khẩu (reset qua email) | 🟢 C | 3 | Sprint 4 | 📋 To Do |

---

### EPIC EP-02 – Quản lý Server

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-02-01 | Tạo server mới | 🔴 M | 3 | Sprint 1 | ✅ Done |
| US-02-02 | Mời thành viên qua invite link | 🔴 M | 3 | Sprint 1 | ✅ Done |
| US-02-03 | Rời khỏi server | 🟡 S | 2 | Sprint 2 | ✅ Done |
| US-02-04 | Xóa server (chỉ Admin) | 🟡 S | 2 | Sprint 2 | ✅ Done |
| US-02-05 | Chỉnh sửa thông tin server (tên, ảnh) | 🟢 C | 2 | Sprint 3 | ✅ Done |
| US-02-06 | Phân quyền thành viên (Admin/Member) | 🟡 S | 3 | Sprint 2 | ✅ Done |
| US-02-07 | Kick/Ban thành viên | 🟢 C | 2 | Sprint 3 | ✅ Done |

---

### EPIC EP-03 – Quản lý Channel

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-03-01 | Tạo text channel | 🔴 M | 2 | Sprint 1 | ✅ Done |
| US-03-02 | Xóa channel | 🟡 S | 1 | Sprint 2 | ✅ Done |
| US-03-03 | Đổi tên channel | 🟢 C | 1 | Sprint 3 | ✅ Done |
| US-03-04 | Sắp xếp channel theo thứ tự | 🟢 C | 2 | Sprint 4 | 📋 To Do |
| US-03-05 | Phân quyền xem/gửi tin nhắn theo channel | 🟢 C | 3 | Sprint 4 | 📋 To Do |

---

### EPIC EP-04 – Nhắn tin real-time

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-04-01 | Gửi/nhận tin nhắn text real-time | 🔴 M | 5 | Sprint 1 | ✅ Done |
| US-04-02 | Xem lịch sử tin nhắn | 🔴 M | 3 | Sprint 2 | ✅ Done |
| US-04-03 | @mention thành viên | 🟡 S | 3 | Sprint 2 | ✅ Done |
| US-04-04 | Pin tin nhắn quan trọng | 🟡 S | 2 | Sprint 2 | ✅ Done |
| US-04-05 | Xóa tin nhắn của mình | 🟡 S | 1 | Sprint 2 | ✅ Done |
| US-04-06 | Chỉnh sửa tin nhắn đã gửi | 🟢 C | 2 | Sprint 3 | ✅ Done |
| US-04-07 | React emoji vào tin nhắn | 🟢 C | 3 | Sprint 3 | ✅ Done |
| US-04-08 | Reply (trả lời) một tin nhắn cụ thể | 🟢 C | 3 | Sprint 3 | ✅ Done |
| US-04-09 | Gửi GIF / Sticker | ⚫ W | 5 | – | 📋 To Do |

---

### EPIC EP-05 – Chia sẻ tài liệu

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-05-01 | Upload file vào channel (PDF, DOCX, IMG, ZIP) | 🟡 S | 5 | Sprint 2 | ✅ Done |
| US-05-02 | Preview ảnh trực tiếp trong chat | 🟡 S | 3 | Sprint 2 | 📋 To Do |
| US-05-03 | Download file đã upload | 🟡 S | 2 | Sprint 2 | ✅ Done |
| US-05-04 | Xem danh sách tất cả file trong channel | 🟢 C | 3 | Sprint 3 | ✅ Done (qua tìm kiếm) |
| US-05-05 | Giới hạn dung lượng file upload | 🟡 S | 1 | Sprint 2 | ✅ Done |

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
| US-07-01 | Xem và chỉnh sửa hồ sơ cá nhân | 🟡 S | 2 | Sprint 3 | ✅ Done |
| US-07-02 | Đổi avatar | 🟢 C | 2 | Sprint 3 | 📋 To Do |
| US-07-03 | Đặt trạng thái (Online/Away/Offline) | 🟢 C | 2 | Sprint 4 | 📋 To Do |

---

### EPIC EP-08 – Tìm kiếm

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-08-01 | Tìm kiếm tin nhắn theo từ khóa | 🟡 S | 8 | Sprint 3 | ✅ Done |
| US-08-02 | Tìm kiếm file trong server | 🟡 S | 5 | Sprint 3 | ✅ Done |
| US-08-03 | Tìm kiếm thành viên | 🟡 S | 3 | Sprint 3 | ✅ Done |

---

### EPIC EP-09 – Tin nhắn riêng & Bạn bè

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-09-01 | Nhắn tin 1-1 với người chung server | 🟡 S | 5 | Sprint 3 | ✅ Done |
| US-09-02 | Gửi/nhận lời mời kết bạn theo username | 🟡 S | 3 | Sprint 3 | ✅ Done |
| US-09-03 | Nhắn tin trực tiếp với bạn bè (không cần chung server) | 🟢 C | 3 | Sprint 3 | ✅ Done |

---

### EPIC EP-10 – Learning System (Milestone 2)

| ID | User Story | Priority | SP | Sprint | Status |
|---|---|---|---|---|---|
| US-10-01 | Giảng viên tạo khoá học gắn với server | 🔴 M | 3 | Sprint 5 | ✅ Done |
| US-10-02 | Sinh viên enroll khoá học bằng mã mời | 🔴 M | 2 | Sprint 5 | ✅ Done |
| US-10-03 | Phân quyền Instructor / TA / Student trong course | 🔴 M | 3 | Sprint 5 | ✅ Done |
| US-10-04 | Đăng tài liệu bài học (Lesson) theo thứ tự | 🔴 M | 5 | Sprint 5 | ✅ Done |
| US-10-05 | Giao bài tập (Assignment) có deadline + file | 🔴 M | 5 | Sprint 5 | ✅ Done |
| US-10-06 | Sinh viên nộp bài (Submission), hỗ trợ nộp lại | 🔴 M | 5 | Sprint 5 | ✅ Done |
| US-10-07 | Giảng viên/TA chấm điểm + nhận xét | 🔴 M | 3 | Sprint 5 | ✅ Done |
| US-10-08 | Thông báo real-time khi có điểm mới | 🟡 S | 3 | Sprint 5 | ✅ Done |
| US-10-09 | Nhắc deadline tự động (24h trước hạn) | 🟡 S | 5 | Sprint 6 | 📋 To Do |
| US-10-10 | Gradebook tổng hợp theo course | 🟢 C | 5 | Sprint 6 | 📋 To Do |

---

## 📅 Kế hoạch Sprint (Sprint Planning Overview)

> Dự án thực hiện từ Tuần 5–8 (Milestone 1), Milestone 2 tiếp tục từ Sprint 5.

### Sprint 1 – Nền tảng (Foundation) ✅

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

### Sprint 2 – Cộng tác cơ bản (Core Collaboration) ✅

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
| US-05-03 | Download file | 2 |
| US-05-05 | Giới hạn dung lượng | 1 |
| **Tổng** | | **25** |

---

### Sprint 3 – Trải nghiệm nâng cao (Enhanced UX) ✅

**Mục tiêu:** Bạn bè & DM, tìm kiếm, tương tác phong phú hơn.

| ID | Mô tả | SP |
|---|---|---|
| US-01-04 | Đổi mật khẩu | 2 |
| US-02-05 | Chỉnh sửa thông tin server | 2 |
| US-02-07 | Kick/Ban thành viên | 2 |
| US-03-03 | Đổi tên channel | 1 |
| US-04-06 | Chỉnh sửa tin nhắn | 2 |
| US-04-07 | React emoji | 3 |
| US-04-08 | Reply tin nhắn | 3 |
| US-05-04 | Danh sách file trong channel (qua tìm kiếm) | 3 |
| US-07-01 | Hồ sơ cá nhân | 2 |
| US-08-01 | Tìm kiếm tin nhắn | 8 |
| US-08-02 | Tìm kiếm file | 5 |
| US-08-03 | Tìm kiếm thành viên | 3 |
| US-09-01 | Nhắn tin 1-1 chung server | 5 |
| US-09-02 | Kết bạn theo username | 3 |
| US-09-03 | Nhắn tin với bạn bè | 3 |
| **Tổng** | | **47** |

---

### Sprint 4 – Buffer & Polish (Milestone 1)

**Mục tiêu:** Sửa lỗi, cải thiện UI trước khi bước sang Milestone 2.

| ID | Mô tả | SP |
|---|---|---|
| US-01-05 | Quên mật khẩu | 3 |
| US-03-04 | Sắp xếp channel | 2 |
| US-03-05 | Phân quyền channel | 3 |
| US-05-02 | Preview ảnh trong chat | 3 |
| US-06-01..04 | Thông báo (badge, mention, toggle, push) | 13 |
| US-07-02, 07-03 | Đổi avatar, trạng thái online | 4 |
| Bug fixes & UI polish | – | 5 |
| **Tổng** | | **33** |

---

### Sprint 5 – Learning System nền tảng (Milestone 2) 🔄 Bản đầu tiên đã lên

**Mục tiêu:** Course, Lesson, Assignment, Submission, Grading hoạt động đầy đủ vòng đời cơ bản.

| ID | Mô tả | SP |
|---|---|---|
| US-10-01 | Tạo khoá học gắn với server | 3 |
| US-10-02 | Enroll khoá học bằng mã mời | 2 |
| US-10-03 | Phân quyền Instructor/TA/Student | 3 |
| US-10-04 | Lesson theo thứ tự | 5 |
| US-10-05 | Giao bài tập có deadline + file | 5 |
| US-10-06 | Nộp bài, hỗ trợ nộp lại | 5 |
| US-10-07 | Chấm điểm + nhận xét | 3 |
| US-10-08 | Thông báo real-time khi có điểm | 3 |
| **Tổng** | | **29** |

---

### Sprint 6 – Learning System nâng cao (kế hoạch tiếp theo)

| ID | Mô tả | SP |
|---|---|---|
| US-10-09 | Nhắc deadline tự động | 5 |
| US-10-10 | Gradebook tổng hợp | 5 |
| **Tổng** | | **10** |

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
│   └── Phân quyền Owner / Moderator / Member
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
    ├── Upload file (≤8MB)
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
├── 👤 Profile & Bạn bè
│   ├── Hồ sơ cá nhân, đổi avatar
│   └── Kết bạn, nhắn tin riêng (DM)
│
└── 🔍 Tìm kiếm
    ├── Tin nhắn, file, thành viên
```

### 🎓 Learning System (Milestone 2)

```
Learning System
├── Course & Enrollment
│   ├── Tạo course gắn với server
│   └── Enroll bằng mã mời riêng của course
├── Vai trò Instructor / TA / Student
├── Lesson (tài liệu bài học theo thứ tự)
├── Assignment & Submission
│   ├── Giao bài tập có deadline + file
│   └── Nộp bài / nộp lại, tự đánh dấu trễ hạn
├── Grading
│   ├── Chấm điểm thang 10 + nhận xét
│   └── Thông báo real-time khi có điểm mới
└── (Kế hoạch) Nhắc deadline tự động, Gradebook tổng hợp
```

### Tính năng tương lai (Future Features – Post Milestone 2)

```
Post-Milestone-2 Roadmap
├── 🎙️ Voice / Video Channel
├── 🤖 Bot tích hợp (deadline reminder, poll...)
├── 📱 Mobile App (React Native)
└── 🔗 LMS Integration (Moodle, Google Classroom)
```

---

## 📊 Tổng kết Backlog

| Phân loại | Số items | Tổng SP |
|---|---|---|
| 🔴 Must Have | 19 | 60 |
| 🟡 Should Have | 21 | 55 |
| 🟢 Could Have | 16 | 43 |
| ⚫ Won't Have | 1 | 5 |
| **Tổng** | **57** | **163** |

---

*Tài liệu thuộc Tuần 3 – Dự án CMCord. Cập nhật Sprint 5-6 cho Milestone 2 (Learning System).*
