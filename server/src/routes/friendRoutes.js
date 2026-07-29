const express = require('express');
const { getAll, sendRequest, acceptRequest, removeFriendship } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/',                     getAll);
router.post('/requests',            sendRequest);
router.post('/requests/:id/accept', acceptRequest);
router.delete('/:id',               removeFriendship);

module.exports = router;
