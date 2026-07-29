const express = require('express');
const { updateLesson, reorderLesson, deleteLesson } = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.patch('/:id',         updateLesson);
router.patch('/:id/reorder', reorderLesson);
router.delete('/:id',        deleteLesson);

module.exports = router;
