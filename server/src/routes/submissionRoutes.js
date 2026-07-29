const express = require('express');
const { gradeSubmission } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.patch('/:id/grade', gradeSubmission);

module.exports = router;
