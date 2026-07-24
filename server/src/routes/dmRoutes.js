const express = require('express');
const {
  getContacts, getConversations, getOrCreateConversation,
  getMessages, sendMessage, updateMessage, deleteMessage, toggleReaction,
} = require('../controllers/dmController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/contacts',        getContacts);
router.get('/',                getConversations);
router.post('/',               getOrCreateConversation);
router.get('/:conversationId/messages',  getMessages);
router.post('/:conversationId/messages', upload.single('file'), sendMessage);
router.patch('/messages/:id',        updateMessage);
router.delete('/messages/:id',       deleteMessage);
router.post('/messages/:id/react',   toggleReaction);

module.exports = router;
