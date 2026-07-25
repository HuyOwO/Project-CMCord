// Định dạng dung lượng file cho dễ đọc (vd: 235 KB, 3.2 MB)
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Giới hạn dung lượng file đính kèm, khớp với backend (server/src/middleware/uploadMiddleware.js)
export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
