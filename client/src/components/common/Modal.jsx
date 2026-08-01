// Modal dùng chung cho toàn bộ app (tạo server, tạo channel, join server, hồ sơ...)
// Click ra ngoài overlay để đóng, click vào nội dung bên trong thì không đóng.
// widthClass cho phép modal rộng hơn mặc định w-80 (vd hồ sơ người dùng có nhiều tab/form).
export default function Modal({ isOpen, onClose, children, widthClass = 'w-80' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-cm-sidebar rounded-lg p-6 ${widthClass} shadow-xl max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
