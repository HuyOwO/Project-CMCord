const express = require('express');
const {
  getServers, createServer, getServer, joinServer, deleteServer,
  updateServer, updateServerAvatar, updateNickname, leaveServer,
  updateMemberRole, kickMember, banMember, unbanMember,
} = require('../controllers/serverController');
const { searchServer } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/',          getServers);
router.post('/',         createServer);
router.post('/join',     joinServer);
router.get('/:id',       getServer);
router.patch('/:id',     updateServer);
router.delete('/:id',    deleteServer);

router.get('/:id/search', searchServer);

router.patch('/:id/avatar',               upload.single('avatar'), updateServerAvatar);
router.patch('/:id/nickname',             updateNickname);
router.delete('/:id/leave',               leaveServer);
router.patch('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId',     kickMember);
router.post('/:id/bans/:userId',          banMember);
router.delete('/:id/bans/:userId',        unbanMember);

module.exports = router;
