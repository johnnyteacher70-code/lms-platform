const express = require('express');
const router = express.Router();
const { submitTask, getTeacherSubmissions, updateSubmissionStatus, getStudentSubmissions } = require('../controllers/submissionController');
const upload = require('../config/upload'); // multer konfiguratsiyasi

// .single('file') degani form-data orqali keladigan 'file' nomli faylni ushlab qolib uploads/ ga saqlaydi
router.post('/submissions', upload.single('file'), submitTask);
router.get('/submissions/teacher/:teacherId', getTeacherSubmissions);
router.get('/submissions/student/:studentId', getStudentSubmissions);
router.patch('/submissions/:id', updateSubmissionStatus);

module.exports = router;
