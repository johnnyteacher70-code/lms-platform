const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId, // Kim jo'natgani. Masalan Oqituvchi id si
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: ['assignment_created', 'assignment_graded', 'system_alert'],
    default: 'system_alert'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String, // Bosilganda qayerga otishi
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
