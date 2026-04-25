const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 1-dan boshlanishi kafolatlanadi (Admin UI tomonidan)
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'archive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
