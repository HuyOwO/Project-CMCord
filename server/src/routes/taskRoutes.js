const express = require('express');
const { getTask, updateTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:id',         getTask);
router.patch('/:id',       updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id',      deleteTask);

module.exports = router;
