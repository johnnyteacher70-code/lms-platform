const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  solutionLink: { type: String, default: '' },
  fileUrl: { type: String, default: '' }, // Fayl yuklanganda url saqlanadi
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  grade: { type: Number, default: null }, // O'qituvchi bahosi (0-100)
  feedback: { type: String, default: '' } // O'qituvchi xulosasi/izohi
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
