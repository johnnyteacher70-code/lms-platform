const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  scores: [{
    category: { type: String, enum: ['homework', 'classwork', 'helping', 'other'], default: 'classwork' },
    value: { type: Number, default: 0 }
  }]
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format "YYYY-MM-DD"
  records: [attendanceRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
