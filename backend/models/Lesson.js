const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content: { type: String }, // Nazariy qism yoki eslatma
  videoUrl: { type: String }, // optional video link
  fileUrl: { type: String }, // optional biriktirilgan fayl yo'li
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
