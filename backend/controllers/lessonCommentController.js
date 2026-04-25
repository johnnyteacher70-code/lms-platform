const LessonComment = require('../models/LessonComment');

// Darsga tegishli savol-javoblarni olish
exports.getLessonComments = async (req, res) => {
  try {
    const comments = await LessonComment.find({ lessonId: req.params.lessonId })
      .populate('userId', 'name role')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Savollarni yuklashda xato' });
  }
};

// Yangi savol yoki javob qoldirish
exports.postComment = async (req, res) => {
  try {
    const { lessonId, userId, text, parentId } = req.body;
    const newComment = await LessonComment.create({
      lessonId, userId, text, parentId
    });
    
    const populated = await LessonComment.findById(newComment._id).populate('userId', 'name role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Savol qoldirishda xato' });
  }
};
