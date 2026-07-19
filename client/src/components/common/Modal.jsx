// Modal dùng chung cho toàn bộ app (tạo server, tạo channel, join server...)
// Click ra ngoài overlay để đóng, click vào nội dung bên trong thì không đóng.
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-cm-sidebar rounded-lg p-6 w-80 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
