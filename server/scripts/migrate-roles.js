// Script migrate dữ liệu cũ sang scheme role mới (moderator/member).
// Chạy 1 lần duy nhất sau khi cập nhật code, TRƯỚC khi mở app cho user dùng lại.
//
// Cách chạy (đứng ở thư mục server/):
//   node scripts/migrate-roles.js
//
// Vì sao cần script này:
// - Trước đây role của chủ server trong members[] được lưu là 'admin'.
// - Model mới đổi enum thành ['moderator', 'member'] (chủ server giờ xác định qua field `owner`,
//   không qua role trong members[] nữa) -> giá trị 'admin' cũ không còn hợp lệ với schema mới.
// - Nếu không migrate, lần đầu server load lại document cũ và gọi .save() (ví dụ khi kick/ban/đổi role
//   một thành viên khác trong CÙNG server đó) Mongoose sẽ validate toàn bộ mảng members và báo lỗi
//   vì gặp giá trị 'admin' không nằm trong enum.
//
// Script này thao tác trực tiếp trên MongoDB collection (bỏ qua Mongoose schema validation),
// nên xử lý được document cũ mà không bị chặn bởi enum mới.

require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cmcord';

  await mongoose.connect(uri);
  console.log(`Đã kết nối MongoDB: ${uri}`);

  const servers = mongoose.connection.db.collection('servers');

  // 1. Đổi role cũ 'admin' -> 'moderator' trong mảng members
  //    (chủ server thực sự vẫn được xác định qua field `owner`, không đổi gì ở đây)
  const roleResult = await servers.updateMany(
    { 'members.role': 'admin' },
    { $set: { 'members.$[elem].role': 'moderator' } },
    { arrayFilters: [{ 'elem.role': 'admin' }] }
  );
  console.log(`✓ Đã đổi role 'admin' -> 'moderator': ${roleResult.modifiedCount} server bị ảnh hưởng`);

  // 2. Thêm field bannedUsers (rỗng) cho các server được tạo trước khi có tính năng ban
  const banResult = await servers.updateMany(
    { bannedUsers: { $exists: false } },
    { $set: { bannedUsers: [] } }
  );
  console.log(`✓ Đã thêm field bannedUsers: ${banResult.modifiedCount} server bị ảnh hưởng`);

  // 3. Kiểm tra lại: còn document nào có role lạ (không phải moderator/member) không
  const invalidCount = await servers.countDocuments({
    members: { $elemMatch: { role: { $nin: ['moderator', 'member'] } } },
  });
  if (invalidCount > 0) {
    console.warn(`⚠ Vẫn còn ${invalidCount} server có role không hợp lệ trong members[], kiểm tra thủ công lại nhé.`);
  } else {
    console.log('✓ Không còn role nào không hợp lệ trong members[].');
  }

  console.log('Migrate hoàn tất!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Migrate thất bại:', err);
  process.exit(1);
});
