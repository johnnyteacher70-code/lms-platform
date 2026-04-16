require('dotenv').config(); // Load environment variables from .env file
const dns = require('dns');
// Mahalliy provayder (ISP) MongoDB ning SRV yozuvlarini bloklamasligi uchun xavfsiz Google DNS serverlariga o'tamiz
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose'); // Require Mongoose here
const cors = require('cors');
const http = require('http');

const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const groupRoutes = require('./routes/groupRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors()); // Frontend Reactdan gelen sourceni o'tkazish
app.use(express.json()); // Kelgan request body ni JSON ga ogirish

// static uploads access
app.use('/uploads', express.static('uploads'));

// Asosiy route (yo'llarni) ulash
app.use('/api', authRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', submissionRoutes);
app.use('/api', groupRoutes); 
app.use('/api', attendanceRoutes);
app.use('/api', moduleRoutes);
app.use('/api', notificationRoutes);
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[MongoDB Atlas] Ulanish muvaffaqiyatli amalga oshirildi!');
    
    // Start the Express server only AFTER the database connection is successful
    const io = require('./socket').init(server); // Initialize Socket

    server.listen(PORT, () => {
      console.log(`Express Server va Socket.io muvaffaqiyatli ishga tushdi: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('[MongoDB Atlas Xatolik] Ulanishda xato yuz berdi:', error);
    process.exit(1); // Exit process if the connection fails
  });
