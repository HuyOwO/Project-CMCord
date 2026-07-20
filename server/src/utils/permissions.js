const getRole = (server, userId) => {
  const uid = userId.toString();
  if (server.owner.toString() === uid) return 'owner';
  const member = server.members.find((m) => (m.user._id || m.user).toString() === uid);
  return member ? member.role : null;
};

const canDeleteMessage = (actorRole, authorRole) => {
  if (actorRole === 'owner') return true;
  if (actorRole === 'moderator') return authorRole !== 'owner';
  return false;
};

const canModerateMember = (actorRole, targetRole) => {
  if (actorRole === 'owner') return targetRole !== 'owner';
  if (actorRole === 'moderator') return targetRole === 'member';
  return false;
};


const canChangeRole = (actorRole) => actorRole === 'owner';

module.exports = { getRole, canDeleteMessage, canModerateMember, canChangeRole };
