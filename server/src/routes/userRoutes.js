const express = require('express');
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.patch('/me', protect, updateProfile);

module.exports = router;