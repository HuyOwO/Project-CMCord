// Danh sách emoji được phép thả react, đồng bộ với QUICK_REACTIONS phía client
// (client/src/components/common/ReactionPicker.jsx). Chặn ở backend để tránh trường
// hợp client bị chỉnh sửa (vd gọi thẳng API bằng Postman) gửi emoji/chuỗi tuỳ ý vào
// reactions[] của tin nhắn.
const ALLOWED_REACTIONS = ['👍', '❤️', '😂', '😢', '😡'];

module.exports = { ALLOWED_REACTIONS };
