// Chuẩn hoá URL của file vừa upload, bất kể đang dùng storage backend nào:
// - Cloudinary (multer-storage-cloudinary): req.file.path đã là secure_url đầy đủ (https://...)
// - Local disk (multer.diskStorage): req.file.path là đường dẫn trên ổ đĩa server,
//   phải tự ghép thành '/uploads/<filename>' để client gọi tới route static ở app.js.
const getUploadedFileUrl = (file) => {
  if (!file) return null;
  if (file.path && /^https?:\/\//.test(file.path)) return file.path;
  return `/uploads/${file.filename}`;
};

module.exports = { getUploadedFileUrl };
