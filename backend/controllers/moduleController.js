const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

// ------- MODULES -------
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
     const { moduleId, title, content, videoUrl } = req.body;
     let fileUrl = null;
     
     // req.file mutler orqali keladi
     if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
     }
     
     const newLesson = await Lesson.create({
        moduleId, title, content, videoUrl, fileUrl
     });
     res.status(201).json(newLesson);
  } catch(err) {
     res.status(500).json({ message: 'Dars saqlashda xato' });
  }
};

exports.getLessonsByModule = async (req, res) => {
  try {
     const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ createdAt: 1 }); // Eski darslar ro'yhatda birinchi chiqadi
     res.json(lessons);
  } catch(err) {
     res.status(500).json({ message: 'Xatolik yuz berdi' });
  }
};
