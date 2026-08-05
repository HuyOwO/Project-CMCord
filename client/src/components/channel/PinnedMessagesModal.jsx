import Modal from '../common/Modal';
import AttachmentPreview from '../common/AttachmentPreview';
import { getDisplayName } from '../../utils/permissions';

const formatTime = (date) =>
  new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

// Modal xem tất cả tin nhắn đã ghim của 1 channel, mở từ nút 📌 cạnh ô tìm kiếm ở header
// (ChannelPage.jsx). `pinnedMessages` do ChannelPage quản lý (tải qua
// messageService.getPinned + đồng bộ real-time qua socket 'message_pinned'), modal này
// chỉ hiển thị và gọi ngược `onUnpin` khi người dùng bấm "Bỏ ghim" -- không tự fetch
// riêng để tránh 2 nguồn dữ liệu lệch nhau.
export default function PinnedMessagesModal({ isOpen, onClose, channelName, server, pinnedMessages, onUnpin }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} widthClass="w-[440px]">
      <h2 className="text-white font-bold text-lg mb-1">📌 Tin nhắn đã ghim</h2>
      <p className="text-cm-muted text-xs mb-4">#{channelName}</p>

      {pinnedMessages.length === 0 ? (
        <p className="text-cm-muted text-sm py-8 text-center">
          Chưa có tin nhắn nào được ghim trong channel này.
          <br />
          Hover vào 1 tin nhắn và bấm 📌 để ghim.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-[28rem] overflow-y-auto -mr-2 pr-2">
          {pinnedMessages.map((msg) => (
            <div key={msg._id} className="bg-cm-input rounded-lg p-3 group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-cm-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {getDisplayName(server, msg.author._id, msg.author.username)[0].toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-semibold truncate">
                    {getDisplayName(server, msg.author._id, msg.author.username)}
                  </span>
                  <span className="text-cm-muted text-xs flex-shrink-0">{formatTime(msg.createdAt)}</span>
                </div>
                <button
                  onClick={() => onUnpin(msg._id)}
                  title="Bỏ ghim tin nhắn này"
                  className="opacity-0 group-hover:opacity-100 text-cm-muted hover:text-red-400 text-xs flex-shrink-0 px-2 py-1 rounded hover:bg-cm-bg transition-colors"
                >
                  Bỏ ghim
                </button>
              </div>

              {msg.content && (
                <p className="text-cm-text text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              )}
              {msg.fileUrl && (
                <AttachmentPreview fileUrl={msg.fileUrl} fileName={msg.fileName} fileType={msg.fileType} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4 mt-2 border-t border-cm-border">
        <button onClick={onClose} className="px-4 py-1.5 text-cm-muted hover:text-white text-sm">
          Đóng
        </button>
      </div>
    </Modal>
  );
}
