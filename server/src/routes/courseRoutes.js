const express = require('express');
const { getCourses, createCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:serverId/courses',  getCourses);
router.post('/:serverId/courses', createCourse);

module.exports = router;
