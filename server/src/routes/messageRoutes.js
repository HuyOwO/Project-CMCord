const express = require('express');
const { getMessages, sendMessage, updateMessage, deleteMessage, togglePin, toggleReaction } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:channelId/messages',    getMessages);
router.post('/:channelId/messages',   upload.single('file'), sendMessage);
router.patch('/messages/:id',         updateMessage);
router.delete('/messages/:id',        deleteMessage);
router.patch('/messages/:id/pin',  togglePin);
router.post('/messages/:id/react', toggleReaction);

module.exports = router;
