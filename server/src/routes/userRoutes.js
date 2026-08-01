const express = require('express');
const { updateProfile, updateEmail, updateAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.patch('/me',       protect, updateProfile);
router.patch('/me/email', protect, updateEmail);
router.post('/me/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
