const mongoose = require('mongoose');

const lessonCommentSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kim yozgan (talaba yoki oqituvchi)
  text: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonComment', default: null } // Javoblar uchun (optional)
}, { timestamps: true });

module.exports = mongoose.model('LessonComment', lessonCommentSchema);
