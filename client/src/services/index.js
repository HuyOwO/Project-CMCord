import api from './api';

export const authService = {
  register: async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data.data;
  },
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const { data } = await api.put('/auth/password', { oldPassword, newPassword });
    return data;
  },
};

// Milestone 3 (UI cải tiến): mở rộng userService để hỗ trợ trang Hồ sơ cá nhân
// (ProfileModal.jsx) -- đổi username/trạng thái, đổi email (cần mật khẩu), upload avatar.
export const userService = {
  // { username, status } -- không cần mật khẩu, giữ tương thích `avatar` cũ nếu còn nơi dùng.
  updateProfile: async ({ username, status, avatar }) => {
    const { data } = await api.patch('/users/me', { username, status, avatar });
    return data.data;
  },
  // Bắt buộc mật khẩu hiện tại vì email là thông tin nhạy cảm (dùng để đăng nhập/khôi phục).
  updateEmail: async (newEmail, password) => {
    const { data } = await api.patch('/users/me/email', { newEmail, password });
    return data.data;
  },
  // Upload file ảnh trực tiếp (multipart), khác với updateProfile ở trên vốn chỉ nhận JSON.
  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post('/users/me/avatar', form);
    return data.data;
  },
};

export const serverService = {
  getAll: async () => {
    const { data } = await api.get('/servers');
    return data.data;
  },
  create: async (name, description) => {
    const { data } = await api.post('/servers', { name, description });
    return data.data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/servers/${id}`);
    return data.data;
  },
  join: async (inviteCode) => {
    const { data } = await api.post('/servers/join', { inviteCode });
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`/servers/${id}`);
  },
  update: async (id, { name, description }) => {
    const { data } = await api.patch(`/servers/${id}`, { name, description });
    return data.data;
  },
  // Đổi ảnh đại diện (icon) server -- chỉ owner được gọi, backend tự kiểm tra quyền.
  uploadAvatar: async (id, file) => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.patch(`/servers/${id}/avatar`, form);
    return data.data;
  },
  updateNickname: async (id, nickname) => {
    const { data } = await api.patch(`/servers/${id}/nickname`, { nickname });
    return data.data;
  },
  leave: async (id) => {
    await api.delete(`/servers/${id}/leave`);
  },
  updateMemberRole: async (serverId, userId, role) => {
    const { data } = await api.patch(`/servers/${serverId}/members/${userId}/role`, { role });
    return data.data;
  },
  kickMember: async (serverId, userId) => {
    await api.delete(`/servers/${serverId}/members/${userId}`);
  },
  banMember: async (serverId, userId) => {
    await api.post(`/servers/${serverId}/bans/${userId}`);
  },
  unbanMember: async (serverId, userId) => {
    await api.delete(`/servers/${serverId}/bans/${userId}`);
  },
};

export const friendService = {
  getAll: async () => {
    const { data } = await api.get('/friends');
    return data.data;
  },
  sendRequest: async (username) => {
    const { data } = await api.post('/friends/requests', { username });
    return data.data;
  },
  accept: async (requestId) => {
    const { data } = await api.post(`/friends/requests/${requestId}/accept`);
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`/friends/${id}`);
  },
};

export const dmService = {
  getContacts: async () => {
    const { data } = await api.get('/dm/contacts');
    return data.data;
  },
  getConversations: async () => {
    const { data } = await api.get('/dm');
    return data.data;
  },
  getOrCreate: async (userId) => {
    const { data } = await api.post('/dm', { userId });
    return data.data;
  },
  getMessages: async (conversationId, page = 1) => {
    const { data } = await api.get(`/dm/${conversationId}/messages?page=${page}`);
    return data.data;
  },
  send: async (conversationId, content, file = null) => {
    const form = new FormData();
    if (content) form.append('content', content);
    if (file) form.append('file', file);
    const { data } = await api.post(`/dm/${conversationId}/messages`, form);
    return data.data;
  },
  update: async (messageId, content) => {
    const { data } = await api.patch(`/dm/messages/${messageId}`, { content });
    return data.data;
  },
  remove: async (messageId) => {
    await api.delete(`/dm/messages/${messageId}`);
  },
  toggleReaction: async (messageId, emoji) => {
    const { data } = await api.post(`/dm/messages/${messageId}/react`, { emoji });
    return data.data;
  },
};

export const searchService = {
  search: async (serverId, q, scope = 'all') => {
    const { data } = await api.get(`/servers/${serverId}/search`, { params: { q, scope } });
    return data.data;
  },
};

export const channelService = {
  getAll: async (serverId) => {
    const { data } = await api.get(`/servers/${serverId}/channels`);
    return data.data;
  },
  create: async (serverId, name) => {
    const { data } = await api.post(`/servers/${serverId}/channels`, { name });
    return data.data;
  },
  update: async (serverId, channelId, name) => {
    const { data } = await api.patch(`/servers/${serverId}/channels/${channelId}`, { name });
    return data.data;
  },
  remove: async (serverId, channelId) => {
    await api.delete(`/servers/${serverId}/channels/${channelId}`);
  },
};

export const messageService = {
  getAll: async (channelId, page = 1) => {
    const { data } = await api.get(`/channels/${channelId}/messages?page=${page}`);
    return data.data;
  },
  // Milestone 3: toàn bộ tin nhắn đã ghim của channel (không giới hạn phân trang như getAll)
  // -- dùng cho PinnedMessagesModal.jsx, mở từ nút 📌 cạnh ô tìm kiếm ở header.
  getPinned: async (channelId) => {
    const { data } = await api.get(`/channels/${channelId}/pinned`);
    return data.data;
  },
  send: async (channelId, content, file = null, replyTo = null) => {
    const form = new FormData();
    if (content) form.append('content', content);
    if (file) form.append('file', file);
    if (replyTo) form.append('replyTo', replyTo);
    const { data } = await api.post(`/channels/${channelId}/messages`, form);
    return data.data;
  },
  update: async (messageId, content) => {
    const { data } = await api.patch(`/channels/messages/${messageId}`, { content });
    return data.data;
  },
  remove: async (messageId) => {
    await api.delete(`/channels/messages/${messageId}`);
  },
  togglePin: async (messageId) => {
    const { data } = await api.patch(`/channels/messages/${messageId}/pin`);
    return data.data;
  },
  toggleReaction: async (messageId, emoji) => {
    const { data } = await api.post(`/channels/messages/${messageId}/react`, { emoji });
    return data.data;
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Milestone 2 – Learning System (Course / Lesson / Assignment / Submission)
// ────────────────────────────────────────────────────────────────────────────

export const courseService = {
  getAll: async (serverId) => {
    const { data } = await api.get(`/servers/${serverId}/courses`);
    return data.data;
  },
  create: async (serverId, { name, description }) => {
    const { data } = await api.post(`/servers/${serverId}/courses`, { name, description });
    return data.data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/courses/${id}`);
    return data.data;
  },
  update: async (id, { name, description }) => {
    const { data } = await api.patch(`/courses/${id}`, { name, description });
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`/courses/${id}`);
  },
  join: async (inviteCode) => {
    const { data } = await api.post('/courses/join', { inviteCode });
    return data.data;
  },
  updateMemberRole: async (courseId, userId, role) => {
    const { data } = await api.patch(`/courses/${courseId}/members/${userId}/role`, { role });
    return data.data;
  },
  removeMember: async (courseId, userId) => {
    await api.delete(`/courses/${courseId}/members/${userId}`);
  },
  getGradebook: async (id) => {
    const { data } = await api.get(`/courses/${id}/gradebook`);
    return data.data;
  },
};

export const lessonService = {
  getAll: async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/lessons`);
    return data.data;
  },
  create: async (courseId, { title, content }, file = null) => {
    const form = new FormData();
    form.append('title', title);
    if (content) form.append('content', content);
    if (file) form.append('file', file);
    const { data } = await api.post(`/courses/${courseId}/lessons`, form);
    return data.data;
  },
  update: async (id, { title, content }) => {
    const { data } = await api.patch(`/lessons/${id}`, { title, content });
    return data.data;
  },
  reorder: async (id, order) => {
    const { data } = await api.patch(`/lessons/${id}/reorder`, { order });
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`/lessons/${id}`);
  },
};

export const assignmentService = {
  getAll: async (courseId) => {
    const { data } = await api.get(`/courses/${courseId}/assignments`);
    return data.data;
  },
  create: async (courseId, { title, description, deadline }, file = null) => {
    const form = new FormData();
    form.append('title', title);
    if (description) form.append('description', description);
    if (deadline) form.append('deadline', deadline);
    if (file) form.append('file', file);
    const { data } = await api.post(`/courses/${courseId}/assignments`, form);
    return data.data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/assignments/${id}`);
    return data.data;
  },
  update: async (id, { title, description, deadline }) => {
    const { data } = await api.patch(`/assignments/${id}`, { title, description, deadline });
    return data.data;
  },
  remove: async (id) => {
    await api.delete(`/assignments/${id}`);
  },
};

export const submissionService = {
  // instructor/TA -> tất cả bài nộp; student -> chỉ bài nộp của chính mình
  getAll: async (assignmentId) => {
    const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
    return data.data;
  },
  submit: async (assignmentId, content, file = null) => {
    const form = new FormData();
    if (content) form.append('content', content);
    if (file) form.append('file', file);
    const { data } = await api.post(`/assignments/${assignmentId}/submissions`, form);
    return data.data;
  },
  grade: async (id, { score, feedback }) => {
    const { data } = await api.patch(`/submissions/${id}/grade`, { score, feedback });
    return data.data;
  },
};
