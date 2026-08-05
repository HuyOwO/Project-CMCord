import { useState } from 'react';

// 5 emoji react được hỗ trợ, PHẢI khớp với ALLOWED_REACTIONS ở
// server/src/utils/reactions.js -- đổi 1 bên thì phải đổi cả 2 để tránh emoji bị
// backend từ chối âm thầm (400) khi người dùng chọn.
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😢', '😡'];

// Bảng chọn emoji nhỏ, hiện lên khi DI CHUỘT vào nút kích hoạt (không cần bấm) --
// giữ chuột trong toàn bộ vùng (nút + bảng) để không bị đóng khi di chuyển chuột lên
// bảng chọn. Dùng chung cho ChannelPage và DMPage.
export default function ReactionPicker({
  onSelect,
  triggerTitle = 'Thả cảm xúc',
  triggerClassName = 'text-cm-muted hover:text-white hover:bg-cm-input text-base p-1.5 rounded transition-colors',
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button type="button" title={triggerTitle} className={triggerClassName}>
        😀
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1 flex items-center gap-0.5 bg-cm-bg border border-cm-border rounded-full px-1.5 py-1 shadow-lg z-20">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              title={emoji}
              className="text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-cm-input hover:scale-125 transition-transform flex-shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
