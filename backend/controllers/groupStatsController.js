const User = require('../models/User');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');

exports.getGroupStats = async (req, res) => {
  try {
    const { groupId } = req.params;

    // 1. Guruhdagi barcha o'quvchilarni topish
    const students = await User.find({ groupId, role: 'student' }).select('name _id');
    
    // 2. Guruhdagi jami darslar sonini hisoblash
    const totalLessons = await Attendance.countDocuments({ groupId });

    const leaderboard = [];

    for (const student of students) {
      // 3. Har bir o'quvchining jami ballarini hisoblash
      const submissions = await Submission.find({ 
        studentId: student._id, 
        grade: { $ne: null } 
      });
      const totalPoints = submissions.reduce((sum, sub) => sum + sub.grade, 0);

      // 4. Har bir o'quvchining davomatini hisoblash
      const attendances = await Attendance.find({ 
        groupId, 
        "records.studentId": student._id,
        "records.status": "present"
      });
      const presentCount = attendances.length;
      const attendancePcnt = totalLessons > 0 ? Math.round((presentCount / totalLessons) * 100) : 0;

      leaderboard.push({
        _id: student._id,
        name: student.name,
        totalPoints,
        attendancePcnt,
        submissionsCount: submissions.length
      });
    }

    // 5. Ballar bo'yicha saralash (eng baland ball yuqorida)
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    res.json({
      groupId,
      totalLessons,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ message: "Guruh statistikasini yuklashda xatolik", error: error.message });
  }
};
