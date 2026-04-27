const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionId: String,
    selectedOption: Number,
    isCorrect: Boolean
  }],
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
