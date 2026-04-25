const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// ------- MODULES -------
// ... (createModule, getTeacherModules, getStudentModules remain same)

exports.createModule = async (req, res) => {
  try {
     const { title, teacherId, groupId } = req.body;
     const newModule = await Module.create({ title, teacherId, groupId });
     const populated = await Module.findById(newModule._id).populate('groupId', 'name');
     res.status(201).json(populated);
  } catch(err) {
     res.status(500).json({ message: 'Modul yaratishda xato' });
  }
};

exports.getTeacherModules = async (req, res) => {
  try {
     const modules = await Module.find({ teacherId: req.params.teacherId })
                                 .populate('groupId', 'name')
                                 .sort({ createdAt: -1 });
     res.json(modules);
  } catch(err) {
     res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};

exports.getStudentModules = async (req, res) => {
  try {
     const modules = await Module.find({ groupId: req.params.groupId })
                                 .populate('teacherId', 'name')
                                 .sort({ createdAt: 1 });
     res.json(modules);
  } catch(err) {
     res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};

// ------- LESSONS -------
exports.createLesson = async (req, res) => {
  try {
     const { moduleId, title, content, videoUrl, passingGrade } = req.body;
     let fileUrl = null;
     
     if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
     }
     
     const newLesson = await Lesson.create({
        moduleId, title, content, videoUrl, fileUrl, passingGrade: passingGrade || 60
     });
     res.status(201).json(newLesson);
  } catch(err) {
     res.status(500).json({ message: 'Dars saqlashda xato' });
  }
};

exports.getLessonsByModule = async (req, res) => {
  try {
     const { userId } = req.query; // Progressni tekshirish uchun userId ixtiyoriy
     const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ createdAt: 1 });
     
     const lessonsWithProgress = await Promise.all(lessons.map(async (lesson) => {
        // Har bir darsga tegishli vazifani topish
        const assignment = await Assignment.findOne({ lessonId: lesson._id });
        let submission = null;
        
        if (assignment && userId) {
           submission = await Submission.findOne({ assignmentId: assignment._id, studentId: userId });
        }
        
        return {
           ...lesson.toObject(),
           assignment: assignment ? {
              _id: assignment._id,
              title: assignment.title,
              submission: submission ? {
                 status: submission.status,
                 grade: submission.grade
              } : null
           } : null
        };
     }));

     res.json(lessonsWithProgress);
  } catch(err) {
     res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};
