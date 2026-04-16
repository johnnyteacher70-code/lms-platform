const Attendance = require('../models/Attendance');

exports.saveAttendance = async (req, res) => {
  try {
    const { groupId, teacherId, date, records } = req.body;
    
    // Agar o'sha kungi davomat oldin qilingan bo'lsa uni ustidan yozamiz
    let attendance = await Attendance.findOne({ groupId, date });
    if (attendance) {
       attendance.records = records;
       await attendance.save();
    } else {
       attendance = await Attendance.create({ groupId, teacherId, date, records });
    }
    
    res.status(200).json(attendance);
  } catch(err) {
    res.status(500).json({ message: 'Davomatni saqlashda xatolik', error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  const { groupId, date } = req.query;
  try {
    const attendance = await Attendance.findOne({ groupId, date });
    res.json(attendance || { records: [] });
  } catch(err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};
