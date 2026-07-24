const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// --- Chọn nơi lưu file ---
// Có cấu hình Cloudinary (biến môi trường CLOUDINARY_*) -> lưu lên Cloudinary,
// dùng cho khi deploy thật (file không bị mất khi container restart/redeploy).
// Chưa cấu hình -> fallback lưu đĩa cục bộ, tiện cho dev/test trên máy.
const cloudinaryStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: 'cmcord/attachments',
        resource_type: 'auto', // ảnh/video -> tối ưu qua CDN, file khác (pdf, zip...) -> lưu dạng raw
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      }),
    })
  : null;

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|zip/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  ext ? cb(null, true) : cb(new Error('File type not allowed'));
};

const upload = multer({
  storage: cloudinaryStorage || localStorage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

module.exports = upload;
