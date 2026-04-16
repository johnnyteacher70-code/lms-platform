const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Xabarlarni yuklashda xatolik", error });
  }
};

exports.getTeacherContacts = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const teacherGroups = await Group.find({ teacherId });
    const groupIds = teacherGroups.map(g => g._id);
    
    const students = await User.find({ groupId: { $in: groupIds }, role: 'student' }).select('name email _id');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Kontaktlarni yuklashda xatolik", error });
  }
};

exports.getStudentTeacher = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);
    if (!student || !student.groupId) return res.json(null);
    
    const group = await Group.findById(student.groupId).populate('teacherId', 'name email _id');
    res.json(group ? group.teacherId : null);
  } catch (error) {
    res.status(500).json({ message: "O'qituvchini topishda xatolik", error });
  }
};
