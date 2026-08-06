import { parseMentions } from '../../utils/mentions';

// Render nội dung tin nhắn, tô màu các đoạn @mention để dễ nhận biết:
// - @everyone hoặc @<username của chính người đang xem> -> tô VÀNG nổi bật (mention nhắm vào họ)
// - @<username người khác> -> tô xanh nhạt như pill thường (mention nhưng không nhắm vào họ)
export default function MessageContent({ content, currentUsername }) {
  const parts = parseMentions(content);
  return (
    <>
      {parts.map((part, i) => {
        if (part.type !== 'mention') return <span key={i}>{part.value}</span>;
        const isMe = part.value === 'everyone' || part.value.toLowerCase() === currentUsername?.toLowerCase();
        return (
          <span
            key={i}
            className={`rounded px-0.5 font-medium ${
              isMe ? 'bg-yellow-400/25 text-yellow-300' : 'bg-cm-accent/15 text-cm-accent'
            }`}
          >
            @{part.value}
          </span>
        );
      })}
    </>
  );
}
