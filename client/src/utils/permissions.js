export const getRole = (server, userId) => {
  if (!server || !userId) return null;
  const ownerId = server.owner?._id || server.owner;
  if (ownerId === userId) return 'owner';
  const member = server.members?.find((m) => (m.user?._id || m.user) === userId);
  return member?.role || null;
};

export const canDeleteMessage = (actorRole, authorRole) => {
  if (actorRole === 'owner') return true;
  if (actorRole === 'moderator') return authorRole !== 'owner';
  return false;
};

export const canModerateMember = (actorRole, targetRole) => {
  if (actorRole === 'owner') return targetRole !== 'owner';
  if (actorRole === 'moderator') return targetRole === 'member';
  return false;
};

export const getDisplayName = (server, userId, fallbackUsername) => {
  const member = server?.members?.find((m) => (m.user?._id || m.user) === userId);
  return member?.nickname || fallbackUsername;
};

export const canChangeRole = (actorRole) => actorRole === 'owner';
