const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
   createModule, 
   getTeacherModules, 
   getStudentModules, 
   createLesson, 
   getLessonsByModule 
} = require('../controllers/moduleController');

// Fayllar yuklanishi uchun multer konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Barcha materiallar /uploads/ papkaga yig'iladi
  },
  filename: (req, file, cb) => {
     // Ismlar takrorlanmasligi uchun
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Modullar API
router.post('/modules', createModule);
router.get('/modules/teacher/:teacherId', getTeacherModules);
router.get('/modules/student/:groupId', getStudentModules);

// Kunlik Darslar API (Faqat bitta fayl yuklanishiga ruxsat beramiz)
router.post('/lessons', upload.single('material'), createLesson);
router.get('/lessons/:moduleId', getLessonsByModule);

module.exports = router;
