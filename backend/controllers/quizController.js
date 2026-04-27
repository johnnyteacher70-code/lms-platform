const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');

// O'qituvchi uchun: Yangi test yaratish
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, groupId, questions, duration, deadline } = req.body;
    const teacherId = req.user._id;

    const quiz = await Quiz.create({
      title,
      description,
      teacherId,
      groupId,
      questions,
      duration,
      deadline
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Test yaratishda xatolik', error: error.message });
  }
};

// Guruh uchun testlarni olish
exports.getGroupQuizzes = async (req, res) => {
  try {
    const { groupId } = req.params;
    const quizzes = await Quiz.find({ groupId }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Testlarni yuklashda xatolik', error: error.message });
  }
};

// Student uchun: Testni topshirish (Avtomatik tekshirish bilan)
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers: [{ questionId, selectedOption }]
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Test topilmadi' });

    // Oldin topshirganmi tekshiramiz
    const existingSubmission = await QuizSubmission.findOne({ quizId, studentId });
    if (existingSubmission) return res.status(400).json({ message: 'Siz bu testni topshirib bo\'lgansiz' });

    let score = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    quiz.questions.forEach(q => {
      const studentAnswer = answers.find(a => a.questionId === q._id.toString());
      const isCorrect = studentAnswer && studentAnswer.selectedOption === q.correctAnswer;
      
      if (isCorrect) score += q.points;
      totalPoints += q.points;

      processedAnswers.push({
        questionId: q._id,
        selectedOption: studentAnswer ? studentAnswer.selectedOption : -1,
        isCorrect
      });
    });

    const submission = await QuizSubmission.create({
      quizId,
      studentId,
      answers: processedAnswers,
      score,
      totalPoints
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Testni yakunlashda xatolik', error: error.message });
  }
};

// Studentning o'z natijalarini olish
exports.getStudentQuizResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const results = await QuizSubmission.find({ studentId }).populate('quizId', 'title');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Natijalarni yuklashda xatolik', error: error.message });
  }
};
