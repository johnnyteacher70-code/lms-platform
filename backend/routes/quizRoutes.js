const express = require('express');
const router = express.Router();
const { createQuiz, getGroupQuizzes, submitQuiz, getStudentQuizResults } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/quizzes', protect, createQuiz);
router.get('/quizzes/group/:groupId', protect, getGroupQuizzes);
router.post('/quizzes/submit', protect, submitQuiz);
router.get('/quizzes/my-results', protect, getStudentQuizResults);

module.exports = router;
