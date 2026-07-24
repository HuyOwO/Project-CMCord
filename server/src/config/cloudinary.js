const { v2: cloudinary } = require('cloudinary');

// Cloudinary CHỈ được cấu hình khi đủ 3 biến môi trường bên dưới.
// Nếu chưa set (vd đang dev local, chưa muốn tạo tài khoản Cloudinary),
// uploadMiddleware.js sẽ tự động fallback về lưu đĩa cục bộ như trước.
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = { cloudinary, isCloudinaryConfigured };
