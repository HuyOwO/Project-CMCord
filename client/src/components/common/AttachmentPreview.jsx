import { useState } from 'react';
import { resolveFileUrl } from '../../config';

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;

const looksLikeImage = (fileType, fileName, fileUrl) =>
  fileType?.startsWith('image/') || IMAGE_EXT_RE.test(fileName || fileUrl || '');

// File đính kèm dùng chung cho tin nhắn, bài học, bài tập, bài nộp:
// - Ảnh -> hiện preview ngay trong giao diện, không cần mở tab mới hay tải về mới xem được.
//   Vẫn bấm được vào ảnh để mở bản đầy đủ ở tab mới nếu cần xem full size.
// - File khác (PDF, DOCX, ZIP...) -> giữ nguyên dạng link tải xuống như cũ.
export default function AttachmentPreview({ fileUrl, fileName, fileType, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (!fileUrl) return null;

  const url = resolveFileUrl(fileUrl);
  const isImage = !broken && looksLikeImage(fileType, fileName, fileUrl);

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={fileName || 'Xem ảnh cỡ đầy đủ'}
        className={`inline-block mt-1 ${className}`}
      >
        <img
          src={url}
          alt={fileName || 'Ảnh đính kèm'}
          onError={() => setBroken(true)}
          loading="lazy"
          className="max-w-[280px] max-h-64 rounded-lg border border-cm-border object-contain"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`text-cm-accent text-xs hover:underline mt-1 block ${className}`}
    >
      📎 {fileName || 'Tải file đính kèm'}
    </a>
  );
}
