const User = require('../models/User');
const Group = require('../models/Group');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalGroups = await Group.countDocuments();
    
    // Guruhlar bo'yicha statistika
    const groups = await Group.find().populate('teacherId', 'name');
    const groupData = [];
    
    for (const group of groups) {
      const studentCount = await User.countDocuments({ groupId: group._id, role: 'student' });
      const attendanceCount = await Attendance.countDocuments({ groupId: group._id });
      
      groupData.push({
        name: group.name,
        students: studentCount,
        teacher: group.teacherId?.name || 'N/A',
        // Kelgusida ko'proq ma'lumot qo'shish mumkin
      });
    }

    res.json({
      summary: {
        students: totalStudents,
        teachers: totalTeachers,
        groups: totalGroups
      },
      groupData
    });
  } catch (error) {
    res.status(500).json({ message: 'Statistikani olishda xatolik', error: error.message });
  }
};
