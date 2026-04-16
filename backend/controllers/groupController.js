const Group = require('../models/Group');

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

const User = require('../models/User');

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
