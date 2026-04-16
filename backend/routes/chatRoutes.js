const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/chat/messages/:user1/:user2', chatController.getMessages);
router.get('/chat/contacts/teacher/:teacherId', chatController.getTeacherContacts);
router.get('/chat/contacts/student/:studentId', chatController.getStudentTeacher);

module.exports = router;
