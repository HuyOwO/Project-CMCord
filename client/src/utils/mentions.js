// Regex khớp 1 token @xxx là mention hợp lệ (@everyone hoặc @<username>).
// (?<![\w@]) đảm bảo '@' không dính liền phía sau 1 ký tự chữ/số/gạch dưới hay '@' khác,
// tránh nhận nhầm phần giữa của 1 email (vd "abc@gmail.com") thành mention.
const MENTION_REGEX = /(?<![\w@])@(everyone|[a-zA-Z0-9_]+)/g;

// Tách nội dung tin nhắn thành mảng đoạn: đoạn text thường xen kẽ đoạn mention, để
// component render riêng từng phần (tô màu mention, giữ nguyên text thường).
// vd "hi @userA ơi" -> [{type:'text',value:'hi '}, {type:'mention',value:'userA'}, {type:'text',value:' ơi'}]
export const parseMentions = (content) => {
  if (!content) return [{ type: 'text', value: '' }];
  const parts = [];
  let lastIndex = 0;
  const regex = new RegExp(MENTION_REGEX);
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    parts.push({ type: 'mention', value: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) parts.push({ type: 'text', value: content.slice(lastIndex) });
  return parts;
};

// Tin nhắn có mention người dùng `username` hay không (khớp @everyone hoặc đúng
// @<username của chính họ>, không phân biệt hoa/thường) -- dùng để tô vàng khung tin nhắn.
export const isMentioned = (content, username) => {
  if (!content || !username) return false;
  return parseMentions(content).some(
    (p) => p.type === 'mention' && (p.value === 'everyone' || p.value.toLowerCase() === username.toLowerCase())
  );
};
