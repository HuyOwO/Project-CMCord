# Báo cáo Kiểm thử – Dự án CMCord

> Tài liệu này có thể đổi tên/đánh số lại cho khớp chuỗi "Bước N" của môn học (vd đặt
> tiếp sau `PRODUCT_BACKLOG.md`) — nội dung độc lập với cách đặt tên file.
>
> **Ngày lập báo cáo:** theo ngày nộp bài của nhóm.
> **Phạm vi:** Milestone 1 (Chat MVP) + Milestone 2 (Learning System) + các cải tiến UI
> gần nhất (Hồ sơ người dùng, trạng thái online, icon tương tác).

---

## 1. Mục tiêu kiểm thử

- Xác nhận các luồng nghiệp vụ **cốt lõi và nhạy cảm về bảo mật** (phân quyền
  owner/moderator/member, phân quyền instructor/ta/student, xác thực tài khoản) hoạt
  động đúng như thiết kế, KHÔNG để lộ quyền do lỗi logic.
- Xác nhận các hàm tiện ích dùng chung (format dung lượng file, chuẩn hoá URL upload,
  kết hợp trạng thái online) trả về đúng giá trị ở các trường hợp biên.
- Lập danh sách test case thủ công bao phủ toàn bộ User Story trong
  `PRODUCT_BACKLOG.md`, làm căn cứ để nhóm tự kiểm thử thủ công trước khi nộp bài và
  trong các đợt hồi quy (regression) sau này.
- Ghi nhận lại các lỗi đã phát hiện & khắc phục trong quá trình phát triển (Bug Log) để
  minh chứng cho hoạt động QA diễn ra xuyên suốt dự án, không chỉ tới cuối mới làm.

## 2. Chiến lược kiểm thử (Test Strategy)

Dự án dùng kết hợp 2 hình thức kiểm thử, mỗi hình thức nhắm đúng vào loại rủi ro nó xử
lý tốt nhất:

| Hình thức | Áp dụng cho | Vì sao |
|---|---|---|
| **Unit test tự động** (Jest / Vitest) | Hàm phân quyền thuần (`utils/permissions.js`, `utils/coursePermissions.js`), hàm tiện ích thuần (`utils/status.js`, `utils/file.js`, `utils/fileUrl.js`) | Không phụ thuộc DB/network, chạy tức thời, phù hợp nhất để bắt lỗi logic phân quyền — đúng loại lỗi đã từng xảy ra trong dự án (xem Bug Log §7) |
| **Unit test có mock** (Jest + `jest.mock`) | 1 controller đại diện (`authController.js`) | Minh hoạ cách kiểm thử tầng controller mà không cần MongoDB thật; pattern này có thể nhân rộng ra các controller còn lại (xem §8 Hạn chế) |
| **Test case thủ công** (Manual/Exploratory) | Toàn bộ luồng UI, real-time (Socket.io), upload file, đăng nhập/đăng ký qua trình duyệt | Các luồng này cần trình duyệt thật + kết nối WebSocket + MongoDB thật; dựng Cypress/Playwright + MongoDB test instance cho toàn bộ luồng vượt quá thời gian còn lại của đợt này — xem lý do chi tiết ở §8 |

**Nguyên tắc minh bạch của báo cáo này:** phần kiểm thử tự động (§4, §5) là kết quả
**đã thực sự chạy**, số liệu lấy trực tiếp từ output của Jest/Vitest, không chỉnh sửa.
Phần test case thủ công (§6) là **bộ test case đã thiết kế sẵn** — cột "Kết quả thực
tế" và "Trạng thái" cần nhóm tự thực thi trên môi trường dev của mình và điền vào trước
khi nộp, vì việc này đòi hỏi thao tác tay trên trình duyệt mà báo cáo không thể tự thực
hiện thay được.

## 3. Môi trường & công cụ

| Thành phần | Công cụ | Phiên bản đã dùng khi chạy thử |
|---|---|---|
| Backend unit test | Jest | 29.7.0 |
| Frontend unit test | Vitest (đồng bộ hệ sinh thái Vite sẵn có) | 2.1.9 |
| Runtime | Node.js | 22.22.2 |
| Package manager | npm | 10.9.7 |

### Cách chạy lại kiểm thử tự động

```bash
# Toàn bộ (chạy cả backend + frontend) từ thư mục gốc repo
npm run install:all
npm test

# Hoặc chạy riêng từng phần
cd server && npm test     # Jest, có coverage report
cd client && npm test     # Vitest, có coverage report
```

## 4. Kết quả kiểm thử tự động (số liệu thực tế đã chạy)

### 4.1 Backend (Jest)

```
Test Suites: 8 passed, 8 total
Tests:       84 passed, 84 total
Time:        ~3.3 s
```

| File test | Số test case | Kết quả |
|---|---|---|
| `tests/utils/permissions.test.js` | 14 | ✅ 14/14 pass |
| `tests/utils/coursePermissions.test.js` | 10 | ✅ 10/10 pass |
| `tests/utils/fileUrl.test.js` | 5 | ✅ 5/5 pass |
| `tests/controllers/authController.test.js` | 12 | ✅ 12/12 pass |
| `tests/utils/channelPermissions.test.js` | —* | ✅ pass |
| `tests/controllers/channelController.test.js` | —* | ✅ pass |
| `tests/controllers/taskController.test.js` | —* | ✅ pass |
| `tests/controllers/messageController.test.js` | —* | ✅ pass |
| **Tổng** | **84** | **✅ 84/84 pass (100%)** |

\* *Lần chạy này dùng chế độ mặc định (không `--verbose`) nên Jest không in số case riêng
cho 4 file mới; tổng 84 là số chính xác Jest báo cáo. Muốn biết số case từng file, chạy lại
với `npx jest --verbose`.*

Coverage (đợt này đo trên **toàn bộ `server/src`**, không còn giới hạn phạm vi như lần
chạy trước):

```
--------------------------|---------|----------|---------|---------|-----------------------------------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------------|---------|----------|---------|---------|-----------------------------------------------
All files                 |   14.65 |    17.39 |   14.51 |   15.04 |
 src                      |       0 |        0 |       0 |       0 |
  app.js                  |       0 |        0 |       0 |       0 | 1-68
 src/config               |       0 |        0 |       0 |       0 |
  cloudinary.js           |       0 |        0 |     100 |       0 | 1-20
  db.js                   |       0 |        0 |       0 |       0 | 1-13
 src/controllers          |   16.18 |       15 |   11.02 |   17.84 |
  assignmentController.js |       0 |        0 |       0 |       0 | 1-124
  authController.js       |     100 |      100 |     100 |     100 |
  channelController.js    |      50 |    40.47 |   33.33 |   54.66 | 23,29-43,49-69,75-86,131
  courseController.js     |       0 |        0 |       0 |       0 | 1-237
  dmController.js         |       0 |        0 |       0 |       0 | 1-231
  friendController.js     |       0 |        0 |       0 |       0 | 1-141
  lessonController.js     |       0 |        0 |       0 |       0 | 1-123
  messageController.js    |   35.65 |    32.35 |   18.18 |   37.71 | 30,39-56,79,93,99-117,123-145,150-159,165-189
  searchController.js     |       0 |        0 |       0 |       0 | 1-83
  serverController.js     |       0 |        0 |       0 |       0 | 1-266
  submissionController.js |       0 |        0 |       0 |       0 | 1-117
  taskController.js       |   69.56 |    61.42 |   55.55 |   77.77 | 13-25,62,68-78,99-100,122,154,172
  userController.js       |       0 |        0 |       0 |       0 | 1-97
 src/jobs                 |       0 |        0 |       0 |       0 |
  deadlineReminderJob.js  |       0 |        0 |       0 |       0 | 1-58
 src/middleware           |       0 |        0 |       0 |       0 |
  authMiddleware.js       |       0 |        0 |       0 |       0 | 1-21
  uploadMiddleware.js     |       0 |        0 |       0 |       0 | 1-47
 src/models               |       0 |        0 |       0 |       0 |  <- toàn bộ schema Mongoose, chưa được import trong test nào
 src/routes               |       0 |      100 |     100 |       0 |  <- route definition, chưa được require trong test nào
 src/socket               |       0 |        0 |       0 |       0 |
  socketHandler.js        |       0 |        0 |       0 |       0 | 1-156
 src/utils                |     100 |      100 |     100 |     100 |
  channelPermissions.js   |     100 |      100 |     100 |     100 |
  coursePermissions.js    |     100 |      100 |     100 |     100 |
  fileUrl.js              |     100 |      100 |     100 |     100 |
  permissions.js          |     100 |      100 |     100 |     100 |
  reactions.js            |     100 |      100 |     100 |     100 |
--------------------------|---------|----------|---------|---------|-----------------------------------------------
```

> **Vì sao tỉ lệ tổng giảm còn ~14.65% dù số test tăng gấp đôi (41 → 84):** lần chạy
> trước coverage chỉ đo trong nhóm file đã có test để bảng dễ đọc; lần này đo trên toàn
> bộ `server/src` nên các controller/model/route **chưa có test** (assignment, course,
> dm, friend, lesson, search, server, submission, user, và toàn bộ `models`, `routes`,
> `middleware`, `jobs`, `config`, `socket`) kéo tỉ lệ tổng xuống — đây là con số phản ánh
> đúng thực tế, không phải các test hiện có bị yếu đi. Xem §8 Hạn chế.
>
> `models/User.js` vẫn 0% vì lý do đã nêu ở lần chạy trước: `authController.test.js`
> dùng `jest.mock('../models/User')` để không phải kết nối MongoDB thật.

### 4.2 Frontend (Vitest)

```
Test Files  5 passed (5)
     Tests  39 passed (39)
  Duration  ~1.15 s
```

| File test | Số test case | Kết quả |
|---|---|---|
| `src/utils/__tests__/permissions.test.js` | 14 | ✅ 14/14 pass |
| `src/utils/__tests__/coursePermissions.test.js` | 6 | ✅ 6/6 pass |
| `src/utils/__tests__/status.test.js` | 9 | ✅ 9/9 pass |
| `src/utils/__tests__/channelPermissions.test.js` | 5 | ✅ 5/5 pass |
| `src/utils/__tests__/file.test.js` | 5 | ✅ 5/5 pass |
| **Tổng** | **39** | **✅ 39/39 pass (100%)** |

Coverage (giới hạn `src/utils/**`, xem `vitest.config.js`):

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   75.83 |    98.33 |   84.61 |   75.83 |
 channelPermissions.js* |   100 |      100 |     100 |     100 |
 coursePermissions.js*  |   100 |      100 |      75 |     100 |
 file.js           |     100 |      100 |     100 |     100 |
 mentions.js       |       0 |        0 |       0 |       0 | 1-31
 permissions.js    |     100 |      100 |     100 |     100 |
 status.js         |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
```

\* *Terminal cắt tên 2 file thành `...Permissions.js`; suy đoán theo thứ tự alphabet
trong bảng gốc là `channelPermissions.js` rồi `coursePermissions.js` — nhóm nên chạy lại
`npx vitest run --coverage` với terminal rộng hơn để xác nhận đúng tên trước khi nộp.
Nếu đúng, `coursePermissions.js` có 1 hàm chưa được test (`% Funcs` = 75%) — nên bổ sung
case cho hàm đó.*

> `mentions.js` (helper xử lý gợi ý @mention) hiện 0% vì đây là tiện ích mới, chưa nằm
> trong phạm vi kiểm thử đợt này — xem §8 Hạn chế.

### 4.3 Tổng hợp

| | Số test case | Pass | Fail | Tỉ lệ pass |
|---|---|---|---|---|
| Backend | 84 | 84 | 0 | 100% |
| Frontend | 39 | 39 | 0 | 100% |
| **Tổng cộng** | **123** | **123** | **0** | **100%** |

## 5. Chi tiết test case tự động theo nhóm chức năng

Vì lý do cần bảo vệ đúng logic **phân quyền**, các bảng dưới liệt kê những test case
quan trọng nhất (không liệt kê hết 75 case để tránh báo cáo quá dài — file test đầy đủ
nằm trong thư mục `server/tests/` và `client/src/utils/__tests__/`).

### 5.1 Phân quyền Server (owner / moderator / member)

| Test ID | Mô tả | Input | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| PERM-01 | `getRole` nhận diện đúng owner dù `server.owner` là raw id hay object đã populate | `server.owner = 'u1'`, `userId = 'u1'` | `'owner'` | ✅ `'owner'` |
| PERM-02 | `canDeleteMessage`: moderator KHÔNG được xoá tin nhắn của owner | `actorRole='moderator'`, `authorRole='owner'` | `false` | ✅ `false` |
| PERM-03 | `canModerateMember`: owner KHÔNG tự kick/ban được owner khác | `actorRole='owner'`, `targetRole='owner'` | `false` | ✅ `false` |
| PERM-04 | `canModerateMember`: moderator chỉ kick/ban được member, không được nhắm vào moderator khác | `actorRole='moderator'`, `targetRole='moderator'` | `false` | ✅ `false` |
| PERM-05 | `canChangeRole`: chỉ owner đổi được role thành viên | `actorRole='moderator'` | `false` | ✅ `false` |

### 5.2 Phân quyền Course (instructor / ta / student)

| Test ID | Mô tả | Input | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| CPERM-01 | `getCourseRole` độc lập hoàn toàn với vai trò Server | course có `instructor`, không đọc gì từ `server` | `'instructor'` | ✅ `'instructor'` |
| CPERM-02 | `canManageCourse`: TA được quản lý nội dung (lesson/assignment/chấm điểm) | `role='ta'` | `true` | ✅ `true` |
| CPERM-03 | `isCourseInstructor`: TA KHÔNG có quyền cấp instructor dù được quản lý nội dung | `role='ta'` | `false` | ✅ `false` |

### 5.3 Xác thực tài khoản (authController)

| Test ID | Mô tả | Input | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| AUTH-01 | Đăng ký thiếu trường bắt buộc bị chặn ngay, không query DB thừa | thiếu `email` | HTTP 400, `User.findOne` không được gọi | ✅ đúng |
| AUTH-02 | Đăng ký trùng email/username bị từ chối | `User.findOne` trả về user có sẵn | HTTP 400 "Email or username already taken" | ✅ đúng |
| AUTH-03 | Đăng nhập sai mật khẩu bị từ chối, không lộ email có tồn tại hay không | `comparePassword` trả `false` | HTTP 401 "Invalid email or password" (thông báo chung, không tiết lộ email đúng/sai) | ✅ đúng |
| AUTH-04 | Đổi mật khẩu sai mật khẩu cũ: **KHÔNG được gọi `save()`** | `comparePassword` trả `false` | HTTP 400, `user.save` không được gọi | ✅ đúng |
| AUTH-05 | Đổi mật khẩu đúng: gán mật khẩu mới rồi gọi `save()` đúng 1 lần (để trigger hook hash lại) | `comparePassword` trả `true` | `user.password` = mật khẩu mới, `save()` gọi 1 lần | ✅ đúng |

### 5.4 Hàm tiện ích (utils)

| Test ID | Mô tả | Input | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| UTIL-01 | `getUploadedFileUrl` nhận diện đúng URL Cloudinary (https) vs đường dẫn đĩa cục bộ | `file.path` là URL Cloudinary | Trả về nguyên URL | ✅ đúng |
| UTIL-02 | `getUploadedFileUrl` ghép đúng `/uploads/<filename>` khi lưu đĩa cục bộ | `file.path` là đường dẫn ổ đĩa | `/uploads/<filename>` | ✅ đúng |
| UTIL-03 | `getEffectiveStatus`: user chọn "Có mặt" nhưng đã ngắt kết nối → luôn hiện "Ngoại tuyến" | `storedStatus='online'`, `onlineUsers` rỗng | `'offline'` | ✅ đúng |
| UTIL-04 | `getEffectiveStatus` không văng lỗi khi `onlineUsers` là `undefined` | `onlineUsers=undefined` | `'offline'`, không throw | ✅ đúng |
| UTIL-05 | `formatFileSize` hiển thị đúng giới hạn 8MB khớp thông báo lỗi backend | `8*1024*1024` | `"8.0 MB"` | ✅ đúng |

## 6. Test case thủ công (Manual Test Case)

> ⚠️ **Cần nhóm tự thực thi và điền cột "Kết quả thực tế" + "Trạng thái" trước khi nộp
> báo cáo.** Các case đánh dấu (*) tham chiếu tới lỗi đã tìm thấy & sửa trong lúc phát
> triển (xem Bug Log §7) — có thể ghi "Pass (đã xác nhận khi sửa bug, xem BUG-0x)".

### 6.1 EP-01 – Xác thực người dùng

| Test ID | Chức năng | Các bước | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|
| MT-01 | Đăng ký tài khoản mới | Vào `/register`, điền đủ thông tin hợp lệ, submit | Tạo tài khoản, tự đăng nhập, chuyển về `/` | ✅ Đúng|
| MT-02 | Đăng ký với email đã tồn tại | Đăng ký lại bằng email đã dùng | Hiện lỗi rõ ràng, không tạo tài khoản trùng | ✅ Đúng |
| MT-03 | Đăng nhập sai mật khẩu | Nhập đúng email, sai mật khẩu | Hiện lỗi, không vào được app | ✅Đúng | 
| MT-04 | Đăng xuất | Bấm "Đăng xuất" ở UserPanel | Về `/login`, token bị xoá khỏi localStorage | ✅Đúng |

### 6.2 EP-02/EP-03 – Server & Channel

| Test ID | Chức năng | Các bước | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| MT-05 | Tạo server mới | Bấm "+", nhập tên, tạo | Server mới xuất hiện, tự có channel `#general` | ✅Đúng |
| MT-06 | Mời & tham gia server bằng mã mời | Copy mã mời, dùng tài khoản khác join | Tài khoản mới xuất hiện trong danh sách thành viên | ✅Đúng|
| MT-07 | Tạo/đổi tên/xoá channel (chỉ owner) | Thử với tài khoản member | Không thấy nút tạo/sửa/xoá channel |✅Đúng|
| MT-08 | Kick/Ban thành viên đúng phân quyền | Moderator thử ban 1 moderator khác | Bị chặn (nút không hiện, theo PERM-04 đã test tự động) |✅Đúng|

### 6.3 EP-04/EP-05 – Nhắn tin & chia sẻ file

| Test ID | Chức năng | Các bước | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|
| MT-09 | Gửi/nhận tin nhắn real-time giữa 2 tab trình duyệt | Mở 2 tab, cùng vào 1 channel, gửi từ tab A | Tab B nhận tin ngay không cần F5 |✅Đúng| |
| MT-10 | Upload file tên tiếng Việt có dấu | Upload file "Báo cáo dự án.docx" | Tên file hiển thị đúng dấu, không bị mojibake | ❌Lỗi | Pass (đã sửa, xem BUG-04) |
| MT-11 | Upload file vượt 8MB | Chọn file 9MB | Bị chặn phía client trước khi gửi lên server | ✅Đúng | |
| MT-12 | @mention thành viên | Gõ `@` giữa chat | Hiện gợi ý đúng tên thành viên bắt đầu bằng ký tự đã gõ | ✅Đúng | |
| MT-13 | Reply, Pin, React, Sửa, Xoá tin nhắn | Hover tin nhắn, thử từng icon (đã phóng to icon gần đây) | Từng hành động hoạt động đúng, icon dễ bấm hơn bản cũ | ✅Đúng | |

### 6.4 EP-09 – Tin nhắn riêng (DM) & Bạn bè

| Test ID | Chức năng | Các bước | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|
| MT-14 | Gửi lời mời kết bạn theo username | Vào tab "Thêm bạn bè", nhập đúng username | Người nhận thấy lời mời real-time (không cần F5) | ✅Đúng | |
| MT-15 | Nhắn tin với người KHÔNG chung server và CHƯA là bạn bè | Thử `dmService.getOrCreate` với người lạ | Bị chặn 403 | ✅Đúng | |
| MT-16 | Chấm trạng thái online/idle/away hiển thị đúng ở DMSidebar & FriendsPanel | Đổi trạng thái ở tài khoản A, xem tài khoản B | Chấm màu cập nhật real-time không cần F5 | ✅Đúng | |

### 6.5 EP-10 – Learning System (Course/Lesson/Assignment/Submission)

| Test ID | Chức năng | Các bước | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|
| MT-17 | Chuyển sang course mà tài khoản CHƯA enroll (*) | Đổi URL sang `courseId` chưa tham gia | Hiện thông báo "chưa tham gia", không kẹt state của course cũ |  ❌Lỗi  | Pass (đã sửa, xem BUG-01) |
| MT-18 | Sinh viên nộp bài không nhập gì (rỗng) | Bấm "Nộp bài" khi chưa nhập nội dung/file | Nút bị disable hoặc hiện lỗi rõ ràng, KHÔNG âm thầm fail (*) |  ❌Lỗi  | Pass (đã sửa, xem BUG-02) |
| MT-19 | Chấm điểm — route param đúng assignment (*) | Instructor chấm 1 bài nộp cụ thể | Điểm được lưu đúng bài nộp đã chọn, không bị lệch |  ❌Lỗi  | Pass (đã sửa, xem BUG-03) |
| MT-20 | Sinh viên nhận toast real-time khi có điểm mới | Instructor chấm điểm, xem màn hình sinh viên | Toast "Có điểm mới" hiện ngay dù đang ở trang khác | ✅Đúng  | |
| MT-21 | Nhắc deadline tự động trong 24h | Tạo assignment deadline < 24h tới, đợi job chạy (hoặc gọi `checkDeadlines` thủ công) | Sinh viên chưa nộp bài nhận toast nhắc hạn |✅Đúng | |

### 6.6 Hồ sơ người dùng & UI (bổ sung gần nhất)

| Test ID | Chức năng | Các bước | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|
| MT-22 | Đổi username | Mở ProfileModal, đổi tên, lưu | Tên mới hiển thị ngay khắp app không cần F5 | ✅Đúng | |
| MT-23 | Đổi email không nhập mật khẩu | Bỏ trống ô mật khẩu, bấm "Đổi email" | Nút bị disable / bị chặn phía server (400) | ✅Đúng | |
| MT-24 | Đổi email sai mật khẩu hiện tại | Nhập sai mật khẩu | HTTP 400 "Mật khẩu hiện tại không đúng", email KHÔNG đổi | ✅Đúng | |
| MT-25 | Upload avatar > 8MB | Chọn ảnh 9MB | Bị chặn phía client trước khi gửi lên server | ✅Đúng | |
| MT-26 | Icon tương tác đủ lớn, dễ bấm trên các màn hình khác nhau | Thử bấm nhanh các icon hover trên tin nhắn ở laptop 13" | Không bị bấm nhầm icon liền kề | ✅Đúng | |

## 7. Nhật ký lỗi đã phát hiện & khắc phục (Bug/Defect Log)

Các lỗi dưới đây được phát hiện qua kiểm thử thủ công/khám phá (exploratory testing)
trong quá trình phát triển Milestone 2, đã được khắc phục trước khi merge:

| Bug ID | Mô tả | Mức độ | Nguyên nhân gốc | Cách khắc phục | Trạng thái |
|---|---|---|---|---|---|
| BUG-01 | Chuyển sang course chưa enroll bị kẹt state/403 âm thầm của course cũ | Trung bình | State không được reset khi `courseId` đổi | Reset toàn bộ state (`course`, `lessons`, `assignments`) ngay khi `courseId` thay đổi, trước cả khi API trả lời | ✅ Đã sửa |
| BUG-02 | Form nộp bài fail âm thầm, người dùng không biết vì sao | Cao (ảnh hưởng trải nghiệm cốt lõi) | Thiếu `.catch()` ở nhiều async form handler | Rà soát và bổ sung `.catch()` + hiện thông báo lỗi cho toàn bộ form liên quan | ✅ Đã sửa |
| BUG-03 | Chấm điểm bị lệch do sai tên route param | Cao (dữ liệu điểm sai) | `req.params.assignmentId` không khớp tên param định nghĩa trong route (`:id`) | Sửa lại đúng tên param trong `submissionController.js` | ✅ Đã sửa |
| BUG-04 | Tên file tiếng Việt có dấu bị lỗi hiển thị (mojibake) khi upload | Trung bình (UX, không mất dữ liệu) | `multer`/`busboy` mặc định decode header bằng `latin1`, sai với tên file UTF-8 | Re-encode `file.originalname` từ `latin1` sang `utf8` ngay trong `uploadMiddleware.js` trước khi lưu | ✅ Đã sửa |

## 8. Hạn chế & hướng phát triển tiếp theo

- **Đã mở rộng test sang 3 controller nữa** (`channelController`, `taskController`,
  `messageController`) ngoài `authController`, nhưng coverage 3 file này còn thấp
  (lần lượt ~55% / ~78% / ~38% theo số dòng) — mới phủ các nhánh chính, chưa phủ hết
  trường hợp biên. **Vẫn chưa có test tự động** cho `server`, `dm`, `friend`, `search`,
  `course`, `lesson`, `assignment`, `submission`, `user` — có thể áp dụng đúng pattern
  mock Model đã dùng ở `authController.test.js` (xem
  `server/tests/controllers/authController.test.js`) để mở rộng dần.
- **Frontend có thêm 1 tiện ích mới chưa có test:** `mentions.js` (xử lý gợi ý @mention)
  — nên bổ sung `mentions.test.js` ở đợt tiếp theo.
- **Chưa có test tích hợp (integration test) với MongoDB thật.** Có thể bổ sung bằng
  `mongodb-memory-server` (MongoDB giả lập chạy trong bộ nhớ, không cần cài MongoDB
  thật) ở đợt phát triển tiếp theo.
- **Chưa có test tự động cho giao diện (component test / E2E).** Toàn bộ phần UI hiện
  đang dựa vào test case thủ công ở §6. Có thể bổ sung React Testing Library cho vài
  component quan trọng (Modal, ProfileModal) hoặc Playwright cho luồng E2E xuyên suốt
  (đăng ký → tạo server → gửi tin nhắn) nếu còn thời gian.
- **Chưa test tải (load test) cho Socket.io** khi nhiều người dùng cùng kết nối — không
  nằm trong phạm vi đồ án môn học nhưng đáng ghi nhận nếu triển khai thật.

## 9. Kết luận

Bộ kiểm thử tự động (123 test case: 84 backend + 39 frontend, **100% pass**) tập trung
đúng vào phần rủi ro cao nhất của dự án — logic phân quyền 2 tầng (Server và Course) và
luồng xác thực tài khoản — nơi một lỗi nhỏ có thể dẫn tới lộ quyền hoặc chiếm tài khoản,
và đã mở rộng thêm sang 3 controller nghiệp vụ chính (channel, task, message). Coverage
đo trên toàn bộ mã nguồn (~14.65% backend) cho thấy rõ những phần còn lại (server, dm,
friend, search, course, lesson, assignment, submission, user) vẫn cần được test ở đợt
sau — đây là số liệu minh bạch, không phải dấu hiệu chất lượng kém của các test hiện có.
Kết hợp với bộ test case thủ công bao phủ toàn bộ User Story trong `PRODUCT_BACKLOG.md`
và nhật ký 4 lỗi thực tế đã phát hiện & khắc phục trong quá trình phát triển, dự án đạt
mức độ đảm bảo chất lượng phù hợp với quy mô một đồ án môn học, đồng thời minh bạch về
những phần chưa kiểm thử để làm căn cứ cho các đợt phát triển tiếp theo.
