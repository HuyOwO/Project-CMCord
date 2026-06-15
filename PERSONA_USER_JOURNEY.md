# Bước 3 – Persona & User Journey Map

## 📌 Tổng quan dự án.

**CMCord** là ứng dụng chat dành riêng cho sinh viên, lấy cảm hứng từ Discord, hỗ trợ giao tiếp nhóm, chia sẻ tài liệu và tổ chức học tập theo kênh (channel).

---

## 👤 Persona

### Persona 1 – Sinh viên thành viên nhóm

| Trường | Thông tin |
|---|---|
| **Tên** | Nguyễn Bê An |
| **Tuổi** | 19 |
| **Vai trò** | Thành viên nhóm dự án |
| **Chuyên ngành** | Kĩ thuật phần mềm |
| **Thiết bị** | Laptop, điện thoại thông minh |

**Mục tiêu:**
- Giao tiếp nhanh với các thành viên trong nhóm mà không cần email.
- Nhận thông báo bài tập, deadline kịp thời.
- Lưu và tìm lại tài liệu nhóm dễ dàng.

**Khó khăn**
- Dùng Messenger cho cả học tập lẫn cá nhân → bị lẫn lộn, khó tìm lại thông tin.
- Không có nơi tổ chức tài liệu theo từng môn học.
- Hay bị bỏ lỡ thông báo quan trọng trong nhóm đông người.

**Hành vi:**
- Dùng điện thoại để nhắn tin, dùng laptop để làm việc.
- Thích giao tiếp bằng text hơn gọi video.
- Thường online vào buổi tối (20h–2h).

---

### Persona 2 – Trưởng nhóm / Team Lead

| Trường | Thông tin |
|---|---|
| **Tên** | Trần Đăng Việt |
| **Tuổi** | 19 |
| **Vai trò** | Trưởng nhóm dự án |
| **Chuyên ngành** | Kĩ thuật phần mềm |
| **Thiết bị** | Laptop, iPhone |

**Mục tiêu:**
- Phân công công việc rõ ràng và theo dõi tiến độ nhóm.
- Tạo kênh riêng biệt cho từng phần của dự án (design, code, báo cáo...).
- Lưu trữ tập trung tài liệu quan trọng.

**Khó khăn:**
- Khó kiểm soát ai đã đọc thông báo quan trọng.
- Phải quản lý nhiều group chat khác nhau cho các môn.
- Không có tính năng giao task trực tiếp trong chat.

**Hành vi:**
- Tạo cấu trúc nhóm ngay từ đầu dự án.
- Hay sử dụng @mention để nhắc nhở thành viên.
- Online liên tục trong giờ học (8h–17h) và tối.

---

### Persona 3 – Giảng viên hướng dẫn (Secondary Persona)

| Trường | Thông tin |
|---|---|
| **Tên** | Lê Minh Quân |
| **Tuổi** | 35 |
| **Vai trò** | Giảng viên phụ trách môn Công Nghệ phần mềm |
| **Thiết bị** | Laptop Windows |

**Mục tiêu:**
- Theo dõi hoạt động của các nhóm sinh viên.
- Gửi thông báo chung cho cả lớp.
- Xem lịch sử chat nhóm khi cần đánh giá.

**Khó khăn**
- Không có kênh liên lạc chuẩn giữa giảng viên và nhóm sinh viên.
- Email phản hồi chậm, sinh viên ít kiểm tra.

---

## 🗺️ User Journey Map

### Journey: Sinh viên tham gia nhóm học và cộng tác lần đầu

**Persona:** Nguyễn Bê An (Sinh viên thành viên nhóm)  
**Kịch bản:** An được thêm vào server CMCord của lớp và cần giao tiếp với nhóm để nộp bài tập nhóm.

---

```
GIAI ĐOẠN        │ Nhận lời mời  │ Onboarding     │ Khám phá       │ Cộng tác       │ Hoàn thành
─────────────────┼───────────────┼────────────────┼────────────────┼────────────────┼──────────────
HÀNH ĐỘNG        │ Nhận link mời │ Đăng ký tài    │ Vào server,    │ Chat trong     │ Nộp file bài
                 │ qua Zalo      │ khoản CMCord   │ xem danh sách  │ channel        │ tập trong
                 │               │                │ channel        │ #bai-tap       │ channel
─────────────────┼───────────────┼────────────────┼────────────────┼────────────────┼──────────────
SUY NGHĨ         │ "Lại thêm     │ "Đăng ký nhanh │ "Ồ, có nhiều   │ "Tiện hơn      │ "Mọi thứ
                 │ một app nữa?" │ không?"        │ kênh thế, tìm  │ Messenger      │ trong 1 chỗ,
                 │               │                │ đúng kênh đây" │ nhiều"         │ tốt thật"
─────────────────┼───────────────┼────────────────┼────────────────┼────────────────┼──────────────
CẢM XÚC          │  Trung lập    │     Trung lập  │     Tò mò      │     Hài lòng   │   Thích
─────────────────┼───────────────┼────────────────┼────────────────┼────────────────┼──────────────
KHÓ KHĂN         │ Lo ngại app   │ Form đăng ký   │ Không biết     │ Không biết     │ –
                 │ mới           │ phức tạp       │ channel nào    │ cách gửi file  │
─────────────────┼───────────────┼────────────────┼────────────────┼────────────────┼──────────────
CƠ HỘI CẢI TIẾN  │ Đăng ký tài   │ Onboarding     │ Sidebar rõ     │ Kéo thả file   │ Thông báo
                 │ khoản bằng    │ wizard (hướng  │ ràng, có       │ trực tiếp vào  │
                 │ Google/GitHub │ dẫn người dùng)│ tooltip giải   │ chat           │
                 │               │                │ thích channel  │                │
```

---

### Điểm chạm (Touchpoints) chính

| # | Touchpoint | Kênh | Mức độ quan trọng |
|---|---|---|---|
| 1 | Nhận link mời tham gia server | External (Messenger/Zalo) | ⭐⭐⭐ |
| 2 | Màn hình đăng ký / đăng nhập | In-app | ⭐⭐⭐⭐⭐ |
| 3 | Màn hình chính (Server + Channel list) | In-app | ⭐⭐⭐⭐⭐ |
| 4 | Gửi tin nhắn văn bản | In-app | ⭐⭐⭐⭐⭐ |
| 5 | Upload & xem tài liệu | In-app | ⭐⭐⭐⭐ |
| 6 | Nhận thông báo (notification) | In-app / Push | ⭐⭐⭐⭐ |
| 7 | Tìm kiếm tin nhắn/file cũ | In-app | ⭐⭐⭐ |

---

*Tài liệu thuộc Tuần 3 – Dự án CMCord ;)*  
