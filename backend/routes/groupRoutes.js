const express = require('express');
const router = express.Router();
const { 
  createGroup, 
  getGroups, 
  getTeacherGroups, 
  deleteGroup, 
  getGroupStudents,
  updateGroup,
  removeStudentFromGroup,
  moveStudentToGroup
} = require('../controllers/groupController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/groups', protect, admin, createGroup);
router.get('/groups', protect, getGroups);
router.get('/groups/teacher/:teacherId', protect, getTeacherGroups);
router.delete('/groups/:id', protect, admin, deleteGroup);
router.get('/groups/:id/students', protect, getGroupStudents);

// Admin uchun maxsus amallar
router.put('/groups/:id', protect, admin, updateGroup);
router.post('/groups/remove-student', protect, admin, removeStudentFromGroup);
router.post('/groups/move-student', protect, admin, moveStudentToGroup);

module.exports = router;
