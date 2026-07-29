const express = require('express');
const {
  getCourse, joinCourse, updateCourse, deleteCourse,
  updateMemberRole, removeMember,
} = require('../controllers/courseController');
const { getLessons, createLesson } = require('../controllers/lessonController');
const { getAssignments, createAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/join',   joinCourse);
router.get('/:id',     getCourse);
router.patch('/:id',   updateCourse);
router.delete('/:id',  deleteCourse);

router.patch('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId',     removeMember);

router.get('/:courseId/lessons',  getLessons);
router.post('/:courseId/lessons', upload.single('file'), createLesson);

router.get('/:courseId/assignments',  getAssignments);
router.post('/:courseId/assignments', upload.single('file'), createAssignment);

module.exports = router;
