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
export const userService = {
  updateProfile: async ({ username, avatar }) => {
    const { data } = await api.patch('/users/me', { username, avatar });
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