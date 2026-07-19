// Thanh icon server bên trái cùng (72px).
// Trước đây HomePage và ChannelPage mỗi nơi tự viết một bản riêng:
// - Bản trong HomePage hiển thị ĐẦY ĐỦ danh sách server.
// - Bản trong ChannelPage chỉ hiển thị 1 icon của server đang mở (bug: không đổi server được).
// Component này gộp lại thành một bản DUY NHẤT, đầy đủ, dùng chung cho cả hai trang.
export default function ServerSidebar({ servers, activeServerId, onSelectServer, onCreateClick, onJoinClick }) {
  return (
    <div className="w-[72px] bg-cm-bg flex flex-col items-center py-3 gap-2 border-r border-cm-border">
      {servers.map((srv) => (
        <button
          key={srv._id}
          onClick={() => onSelectServer(srv)}
          title={srv.name}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all hover:rounded-xl ${
            activeServerId === srv._id
              ? 'bg-cm-accent rounded-xl'
              : 'bg-cm-sidebar hover:bg-cm-accent'
          }`}
        >
          {srv.name[0].toUpperCase()}
        </button>
      ))}

      <button
        onClick={onCreateClick}
        className="w-12 h-12 rounded-full bg-cm-sidebar hover:bg-cm-green hover:rounded-xl text-cm-green hover:text-white flex items-center justify-center text-2xl transition-all"
        title="Tạo server mới"
      >
        +
      </button>

      {onJoinClick && (
        <button
          onClick={onJoinClick}
          className="w-12 h-12 rounded-full bg-cm-sidebar hover:bg-cm-accent hover:rounded-xl text-cm-accent hover:text-white flex items-center justify-center text-lg transition-all"
          title="Tham gia server bằng mã mời"
        >
          🔗
        </button>
      )}
    </div>
  );
}
