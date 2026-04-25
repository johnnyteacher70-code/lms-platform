const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const { getIo } = require('../socket');

exports.submitTask = async (req, res) => {
  const { assignmentId, studentId, solutionLink, notes } = req.body;
  // Agar fayl biriktirilgan bo'lsa server manzilini qo'shamiz
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Vazifa topilmadi' });

    // Dedlayn tekshiruvi 
    if (new Date() > new Date(assignment.deadline)) {
      return res.status(400).json({ message: 'Kechirasiz! Topshirish muddati (Deadline) o\'tib ketgan.' });
    }

    // O'quvchi oldindan topshirib qo'yganligini tekshirish
    const existing = await Submission.findOne({ assignmentId, studentId });
    if (existing) {
      return res.status(400).json({ message: 'Siz bu vazifani allaqachon bajarib jo\'natgansiz!' });
    }

    const newSub = await Submission.create({ 
       assignmentId, 
       studentId, 
       solutionLink: solutionLink || '', 
       fileUrl, 
       notes 
    });
    
    // Yaratilgan submissionni populate qilib qaytarish (frontendda darhol ko'rinishi uchun)
    const populatedSub = await Submission.findById(newSub._id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title deadline groupId');

    res.status(201).json(populatedSub);
  } catch (error) {
    res.status(500).json({ message: 'Server xatoligi yuz berdi' });
  }
};

exports.getTeacherSubmissions = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    // O'qituvchiga tegishli barcha vazifalarni topamiz
    const teacherAssignments = await Assignment.find({ 
      teacherId: new mongoose.Types.ObjectId(teacherId) 
    });
    
    const assignmentIds = teacherAssignments.map(a => a._id);

    // Shu vazifalarga tegishli barcha yechimlarni topamiz
    const submissions = await Submission.find({ 
      assignmentId: { $in: assignmentIds } 
    })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title deadline groupId')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch(err) {
    console.error("getTeacherSubmissions error:", err);
    res.status(500).json({ message: 'Server xatoligi' });
  }
};

exports.updateSubmissionStatus = async (req, res) => {
  const { status, grade, feedback } = req.body;
  try {
    const updateData = { status };
    if (grade !== undefined) updateData.grade = grade;
    if (feedback !== undefined) updateData.feedback = feedback;

    const updated = await Submission.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' }).populate('assignmentId', 'title');
    
    // O'quvchiga bildirishnoma
    try {
      if (status === 'graded' || grade !== undefined) {
        const notification = new Notification({
          recipient: updated.studentId,
          type: 'assignment_graded',
          message: `Sizning "${updated.assignmentId.title}" vazifangiz baholandi. Baho: ${grade !== undefined ? grade : '-'}`,
        });
        await notification.save();
        const io = getIo();
        io.to(updated.studentId.toString()).emit('new_notification', notification);
      }
    } catch (notifErr) {
      console.error("Baholash bildirishnomasida xato: ", notifErr);
    }

    res.json(updated);
  } catch(err) {
    res.status(500).json({ message: 'Baholashda xatolik kuzatildi' });
  }
};

exports.getStudentSubmissions = async (req, res) => {
  const studentId = req.params.studentId;
  try {
    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title deadline')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch(err) {
    res.status(500).json({ message: 'Server xatoligi' });
  }
};
