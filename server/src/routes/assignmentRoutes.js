const express = require('express');
const { getAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { getSubmissions, submitAssignment } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:id',    getAssignment);
router.patch('/:id',  updateAssignment);
router.delete('/:id', deleteAssignment);

router.get('/:id/submissions',  getSubmissions);
router.post('/:id/submissions', upload.single('file'), submitAssignment);

module.exports = router;
