const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // backend ichida uploads papkasiga tushadi
  },
  filename: function (req, file, cb) {
    // Tasodifiy bir xil fayl nomlarini qo'shilib ketishidan saqlash
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
