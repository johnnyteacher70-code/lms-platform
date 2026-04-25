const Attendance = require('../models/Attendance');

exports.saveAttendance = async (req, res) => {
  try {
    const { groupId, teacherId, date, records } = req.body;
    
    let attendance = await Attendance.findOne({ groupId, date });
    if (attendance) {
       attendance.records = records;
       attendance.teacherId = teacherId;
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

exports.getAttendanceMatrix = async (req, res) => {
  const { groupId } = req.params;
  const { limit = 10 } = req.query;
  try {
    // Oxirgi N ta davomat yozuvlarini olish
    const matrix = await Attendance.find({ groupId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Matritsani qaytarishda sanalar bo'yicha sortlash (o'sish tartibida UI uchun)
    res.json(matrix.reverse());
  } catch(err) {
    res.status(500).json({ message: 'Matritsani olishda xatollik', error: err.message });
  }
};
