const express = require('express');
const { getChannels, createChannel, updateChannel, deleteChannel } = require('../controllers/channelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:serverId/channels',           getChannels);
router.post('/:serverId/channels',          createChannel);
router.patch('/:serverId/channels/:id',     updateChannel);
router.delete('/:serverId/channels/:id',    deleteChannel);

module.exports = router;