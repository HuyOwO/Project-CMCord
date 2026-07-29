# Bước 5 – Scenario, Epic & User Story

## 📌 Quy ước viết User Story

> **"As a [role], I want to [action], so that [benefit]."**  
> *(Với tư cách là [vai trò], tôi muốn [hành động], để [lợi ích].)*

**Định nghĩa Done (DoD – Definition of Done):**
- UI hiển thị đúng theo wireframe
- Chức năng hoạt động không lỗi ở môi trường dev
- Đã qua Usability Testing với ít nhất 1 người dùng thực
- Code được review và merge vào nhánh chính

---

## 🎬 Scenario

### Scenario 1 – Sinh viên tham gia lần đầu và khám phá ứng dụng

**Actor:** Nguyễn Bê An – sinh viên mới được mời vào server lớp.  
**Tiền điều kiện:** An nhận được link mời từ trưởng nhóm qua Messenger.  
**Luồng chính:**
1. An mở link, được chuyển đến trang đăng ký CMCord.
2. An tạo tài khoản bằng email sinh viên.
3. An được tự động tham gia vào server của lớp.
4. An xem danh sách channel (📢 thông-bao, 📚 tai-lieu, 💬 chung, 🔨 nhom-1...).
5. An gửi tin nhắn chào hỏi trong channel **#chung**.
6. An upload file bài tập vào channel **#tai-lieu**.

**Kết quả kỳ vọng:** An có thể giao tiếp và chia sẻ tài liệu ngay trong lần đầu dùng.

---

### Scenario 2 – Trưởng nhóm tổ chức server cho dự án môn học

**Actor:** Trần Đăng Việt – trưởng nhóm dự án.  
**Tiền điều kiện:** Việt đã có tài khoản CMCord.  
**Luồng chính:**
1. Việt tạo server mới tên "Nhóm 5 – Dự án PM".
2. Việt tạo các channel: #thong-bao, #thiet-ke, #code, #bao-cao, #chung.
3. Việt mời từng thành viên qua link hoặc email.
4. Việt ghim (pin) tin nhắn quan trọng về deadline dự án.
5. Việt @mention toàn nhóm khi có thông báo khẩn.

**Kết quả kỳ vọng:** Server được tổ chức gọn gàng, các thành viên nắm rõ cấu trúc nhóm.

---

### Scenario 3 – Nhóm cộng tác hoàn thành bài tập

**Actor:** Cả nhóm (4 thành viên).  
**Tiền điều kiện:** Server và channel đã được tạo.  
**Luồng chính:**
1. Trưởng nhóm gửi link Google Doc vào channel **#bao-cao**.
2. Thành viên thảo luận góp ý qua text trong channel.
3. Một thành viên upload bản nháp file DOCX.
4. Trưởng nhóm pin tin nhắn chứa file final.
5. Nhóm nhận thông báo khi có tin nhắn mới.

**Kết quả kỳ vọng:** Tất cả tài liệu và trao đổi tập trung một chỗ, không bị phân tán.

---

## 🗂️ Epic

| ID | Tên Epic | Mô tả | Độ ưu tiên |
|---|---|---|---|
| EP-01 | Xác thực người dùng | Đăng ký, đăng nhập, quản lý tài khoản | 🔴 Cao |
| EP-02 | Quản lý Server | Tạo, chỉnh sửa, xóa server; mời thành viên | 🔴 Cao |
| EP-03 | Quản lý Channel | Tạo, phân loại, xóa channel trong server | 🔴 Cao |
| EP-04 | Nhắn tin real-time | Gửi/nhận tin nhắn text, @mention, emoji | 🔴 Cao |
| EP-05 | Chia sẻ tài liệu | Upload, xem, tải file trong channel | 🟡 Trung bình |
| EP-06 | Thông báo | Push notification, badge đếm tin nhắn chưa đọc | 🟡 Trung bình |
| EP-07 | Tìm kiếm | Tìm tin nhắn, file, thành viên | 🟢 Thấp (Post-MVP) |
| EP-08 | Cài đặt & Hồ sơ | Đổi avatar, tên hiển thị, cài đặt thông báo | 🟢 Thấp |

---

## 📝 User Story

### EP-01 – Xác thực người dùng

#### US-01-01: Đăng ký tài khoản
> **As a** sinh viên mới,  
> **I want to** đăng ký tài khoản bằng email và mật khẩu,  
> **So that** tôi có thể truy cập CMCord và tham gia vào các server lớp học.

**Acceptance Criteria:**
- [ ] Form đăng ký có các trường: Tên hiển thị, Email, Mật khẩu, Xác nhận mật khẩu.
- [ ] Email phải hợp lệ (có dạng `@`), mật khẩu tối thiểu 8 ký tự.
- [ ] Hiện thông báo lỗi rõ ràng nếu email đã tồn tại.
- [ ] Sau đăng ký thành công, chuyển đến màn hình chính.
- [ ] Gửi email xác thực (có thể bỏ qua ở MVP).

**Story Points:** 3  
**Priority:** 🔴 Must Have

---

#### US-01-02: Đăng nhập tài khoản
> **As a** sinh viên đã có tài khoản,  
> **I want to** đăng nhập bằng email và mật khẩu,  
> **So that** tôi có thể tiếp tục sử dụng các server của mình.

**Acceptance Criteria:**
- [ ] Form đăng nhập có trường Email và Mật khẩu.
- [ ] Hiển thị thông báo lỗi nếu sai email/mật khẩu.
- [ ] Có tùy chọn "Ghi nhớ đăng nhập".
- [ ] Sau đăng nhập thành công, chuyển đến danh sách server.

**Story Points:** 2  
**Priority:** 🔴 Must Have

---

#### US-01-03: Đăng xuất
> **As a** người dùng đã đăng nhập,  
> **I want to** đăng xuất khỏi tài khoản,  
> **So that** tài khoản của tôi được bảo mật trên thiết bị dùng chung.

**Acceptance Criteria:**
- [ ] Nút đăng xuất trong menu cài đặt hoặc sidebar.
- [ ] Sau đăng xuất, chuyển về màn hình đăng nhập.
- [ ] Xóa session/token trên client.

**Story Points:** 1  
**Priority:** 🔴 Must Have

---

### EP-02 – Quản lý Server

#### US-02-01: Tạo server mới
> **As a** trưởng nhóm,  
> **I want to** tạo một server mới với tên và ảnh đại diện,  
> **So that** tôi có không gian riêng cho nhóm học tập của mình.

**Acceptance Criteria:**
- [ ] Nút "Tạo Server" hiển thị trên sidebar.
- [ ] Form tạo server gồm: Tên server (bắt buộc), Mô tả (tuỳ chọn), Ảnh đại diện (tuỳ chọn).
- [ ] Server được tạo thành công và hiện trong danh sách server của người tạo.
- [ ] Người tạo tự động là Admin của server.

**Story Points:** 3  
**Priority:** 🔴 Must Have

---

#### US-02-02: Mời thành viên vào server
> **As a** admin server,  
> **I want to** tạo link mời và chia sẻ cho người khác,  
> **So that** các thành viên trong nhóm có thể tham gia server nhanh chóng.

**Acceptance Criteria:**
- [ ] Admin có thể tạo link mời (invite link) dùng một lần hoặc vĩnh viễn.
- [ ] Người nhận link có thể click để tham gia server mà không cần được thêm thủ công.
- [ ] Hiện thông báo thành công sau khi tham gia.

**Story Points:** 3  
**Priority:** 🔴 Must Have

---

#### US-02-03: Xóa/rời server
> **As a** thành viên server,  
> **I want to** rời khỏi server khi không còn cần thiết,  
> **So that** danh sách server của tôi gọn gàng, chỉ hiện server đang hoạt động.

**Acceptance Criteria:**
- [ ] Tùy chọn "Rời server" trong menu server.
- [ ] Xác nhận trước khi rời.
- [ ] Admin không thể rời nếu là người duy nhất – phải chuyển quyền hoặc xóa server.

**Story Points:** 2  
**Priority:** 🟡 Should Have

---

### EP-03 – Quản lý Channel

#### US-03-01: Tạo channel mới
> **As a** admin server,  
> **I want to** tạo các channel theo chủ đề (text channel),  
> **So that** các cuộc trò chuyện được tổ chức rõ ràng theo từng nội dung.

**Acceptance Criteria:**
- [ ] Nút "Tạo Channel" trong sidebar dành cho admin.
- [ ] Nhập tên channel (không chứa khoảng trắng, tự động thay bằng `-`).
- [ ] Channel được hiển thị ngay trong danh sách sau khi tạo.

**Story Points:** 2  
**Priority:** 🔴 Must Have

---

#### US-03-02: Xóa channel
> **As a** admin server,  
> **I want to** xóa channel không còn cần dùng,  
> **So that** server không bị rối với quá nhiều channel.

**Acceptance Criteria:**
- [ ] Tùy chọn "Xóa channel" trong menu channel.
- [ ] Hiển thị cảnh báo xóa toàn bộ lịch sử tin nhắn.
- [ ] Chỉ admin mới có quyền xóa.

**Story Points:** 1  
**Priority:** 🟡 Should Have

---

### EP-04 – Nhắn tin real-time

#### US-04-01: Gửi tin nhắn text trong channel
> **As a** thành viên server,  
> **I want to** gửi tin nhắn văn bản trong một channel,  
> **So that** tôi có thể giao tiếp với các thành viên khác theo thời gian thực.

**Acceptance Criteria:**
- [ ] Ô nhập tin nhắn ở dưới màn hình channel.
- [ ] Nhấn Enter hoặc nút Send để gửi.
- [ ] Tin nhắn hiển thị ngay lập tức với tên người gửi và thời gian.
- [ ] Hỗ trợ tin nhắn nhiều dòng (Shift+Enter).

**Story Points:** 5  
**Priority:** 🔴 Must Have

---

#### US-04-02: @mention thành viên
> **As a** người dùng,  
> **I want to** @mention thành viên trong tin nhắn,  
> **So that** người đó nhận được thông báo và biết mình được nhắc đến.

**Acceptance Criteria:**
- [ ] Gõ `@` để hiện danh sách thành viên gợi ý.
- [ ] Tên được highlight khi được mention trong tin nhắn.
- [ ] Người được mention nhận notification.

**Story Points:** 3  
**Priority:** 🟡 Should Have

---

#### US-04-03: Phản ứng (React) vào tin nhắn
> **As a** người dùng,  
> **I want to** react emoji vào tin nhắn,  
> **So that** tôi có thể phản hồi nhanh mà không cần gửi thêm tin nhắn.

**Acceptance Criteria:**
- [ ] Hover vào tin nhắn hiện nút emoji.
- [ ] Chọn emoji từ bộ emoji cơ bản.
- [ ] Đếm số react và hiển thị dưới tin nhắn.

**Story Points:** 3  
**Priority:** 🟢 Could Have

---

### EP-05 – Chia sẻ tài liệu

#### US-05-01: Upload file vào channel
> **As a** thành viên server,  
> **I want to** upload file (PDF, DOCX, PNG, ZIP) vào channel,  
> **So that** tôi có thể chia sẻ tài liệu trực tiếp trong cuộc trò chuyện nhóm.

**Acceptance Criteria:**
- [ ] Nút đính kèm file trong ô nhập tin nhắn.
- [ ] Hỗ trợ định dạng: PDF, DOCX, XLSX, PNG, JPG, ZIP.
- [ ] Giới hạn dung lượng file: tối đa 25MB.
- [ ] File hiển thị dạng preview hoặc link download trong channel.
- [ ] Hiện thanh tiến trình (progress bar) khi upload.

**Story Points:** 5  
**Priority:** 🟡 Should Have

---

### EP-06 – Thông báo

#### US-06-01: Nhận thông báo tin nhắn mới
> **As a** người dùng,  
> **I want to** nhận thông báo khi có tin nhắn mới trong channel của tôi,  
> **So that** tôi không bỏ lỡ thông tin quan trọng từ nhóm.

**Acceptance Criteria:**
- [ ] Badge số (unread count) hiện trên tên server và channel.
- [ ] Thông báo trong app khi có tin nhắn mới.
- [ ] Người dùng có thể tắt thông báo cho từng channel.

**Story Points:** 3  
**Priority:** 🟡 Should Have

---

## 📊 Tổng hợp Story Points

| Epic | Số User Story | Tổng Story Points |
|---|---|---|
| EP-01 Xác thực | 3 | 6 |
| EP-02 Server | 3 | 8 |
| EP-03 Channel | 2 | 3 |
| EP-04 Nhắn tin | 3 | 11 |
| EP-05 Tài liệu | 1 | 5 |
| EP-06 Thông báo | 1 | 3 |
| **Tổng** | **13** | **36** |

---

*Tài liệu thuộc Tuần 3 – Dự án CMCord*  
