const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getIo } = require('../socket');

exports.getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.groupId) filter.groupId = req.query.groupId;
    if (req.query.teacherId) filter.teacherId = req.query.teacherId;

    // Eng yaqin deadlinelar birinchi chiqadi
    const assignments = await Assignment.find(filter)
        .populate('teacherId', 'name email')
        .populate('groupId', 'name')
        .sort({ deadline: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server xatoligi yuz berdi' });
  }
};

exports.createAssignment = async (req, res) => {
  const { title, description, deadline, teacherId, groupId } = req.body;
  try {
    const newAssignment = await Assignment.create({
      title,
      description,
      deadline,
      teacherId,
      groupId
    });
    
    const populated = await Assignment.findById(newAssignment._id).populate('teacherId', 'name email').populate('groupId', 'name');
    
    // O'quvchilarga bildirishnoma jo'natish
    try {
      const students = await User.find({ groupId: groupId, role: 'student' });
      const notifications = [];
      
      for (const student of students) {
        notifications.push({
          recipient: student._id,
          sender: teacherId,
          type: 'assignment_created',
          message: `O'qituvchi ${populated.teacherId.name} yangi "${title}" vazifasini yukladi.`,
        });
      }
      
      if (notifications.length > 0) {
        const savedNotifs = await Notification.insertMany(notifications);
        const io = getIo();
        savedNotifs.forEach(notif => {
          io.to(notif.recipient.toString()).emit('new_notification', notif);
        });
      }
    } catch(notifErr) {
       console.error("Bildirishnoma jo'natishda xato: ", notifErr);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Vazifa kiritishda xatolik. Maydonlarni to\'g\'ri to\'ldiring.' });
  }
};
