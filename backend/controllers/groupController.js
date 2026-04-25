const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  try {
    const { name, teacherId } = req.body;
    const groupExists = await Group.findOne({ name });
    if (groupExists) return res.status(400).json({ message: 'Bu raqamdagi/nomli guruh allaqachon mavjud!' });
    
    const newGroup = await Group.create({ name, teacherId });
    const populated = await Group.findById(newGroup._id).populate('teacherId', 'name email');
    
    res.status(201).json(populated);
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('teacherId', 'name email').collation({locale: "en_US", numericOrdering: true}).sort({ name: 1 });
    res.json(groups);
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

exports.getTeacherGroups = async (req, res) => {
  const teacherId = req.params.teacherId;
  try {
    const groups = await Group.find({ teacherId }).collation({locale: "en_US", numericOrdering: true}).sort({ name: 1 });
    
    const result = [];
    for (let g of groups) {
      const students = await User.find({ groupId: g._id, role: 'student' }).select('-password -role');
      result.push({
         ...g.toObject(),
         students
      });
    }
    
    res.json(result);
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

// Guruhni o'chirish — o'quvchilarning groupId'sini null ga o'tkazadi
exports.deleteGroup = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Guruh topilmadi' });

    // Guruhdagi barcha o'quvchilarni ozod qilish
    await User.updateMany({ groupId }, { $set: { groupId: null } });

    await Group.findByIdAndDelete(groupId);
    res.json({ message: `"${group.name}" guruhi o'chirildi va o'quvchilar ozod qilindi.` });
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// Guruh ichidagi o'quvchilarni olish (Admin nazorati uchun)
exports.getGroupStudents = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await Group.findById(groupId).populate('teacherId', 'name email');
    if (!group) return res.status(404).json({ message: 'Guruh topilmadi' });

    const students = await User.find({ groupId, role: 'student' })
      .select('-password')
      .sort({ name: 1 });

    res.json({ group, students });
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// Guruhni tahrirlash (o'qituvchini o'zgartirish)
exports.updateGroup = async (req, res) => {
  const groupId = req.params.id;
  const { name, teacherId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Guruh topilmadi' });

    group.name = name || group.name;
    group.teacherId = teacherId || group.teacherId;

    await group.save();
    const populated = await Group.findById(groupId).populate('teacherId', 'name email');
    res.json(populated);
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// O'quvchini guruhdan chiqarish
exports.removeStudentFromGroup = async (req, res) => {
  const { studentId } = req.body;
  try {
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'O\'quvchi topilmadi' });

    student.groupId = null;
    await student.save();

    res.json({ message: 'O\'quvchi guruhdan chiqarildi' });
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// O'quvchini boshqa guruhga o'tkazish
exports.moveStudentToGroup = async (req, res) => {
  const { studentId, newGroupId } = req.body;
  try {
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'O\'quvchi topilmadi' });

    const newGroup = await Group.findById(newGroupId);
    if (!newGroup) return res.status(404).json({ message: 'Yangi guruh topilmadi' });

    student.groupId = newGroupId;
    await student.save();

    res.json({ message: `O'quvchi "${newGroup.name}" guruhiga o'tkazildi` });
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};
