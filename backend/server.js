require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
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
const groupStatsRoutes = require('./routes/groupStatsRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', submissionRoutes);
app.use('/api', groupRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', moduleRoutes);
app.use('/api', notificationRoutes);
app.use('/api', chatRoutes);
app.use('/api', groupStatsRoutes);

const PORT = process.env.PORT || 5000;

const mongooseOptions = {
  serverSelectionTimeoutMS: 15000, // 15 soniya kutadi
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ [MongoDB Atlas] Aloqa uzildi! Qayta ulanishga harakat qilinmoqda...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [MongoDB Atlas] Aloqa muvaffaqiyatli tiklandi!');
});

mongoose
  .connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log('✅ [MongoDB Atlas] Asosiy bazaga ulanish muvaffaqiyatli amalga oshirildi!');
    const io = require('./socket').init(server);
    server.listen(PORT, () => {
      console.log(`🚀 Express Server va Socket.io ishga tushdi: http://localhost:${PORT}`);
    });
  })
  .catch(async (error) => {
    console.error('❌ [MongoDB Atlas Xatolik] Ulanishda xato yuz berdi:', error.message);
    console.log('⚠️ Vaqtinchalik xotira ma\'lumotlar bazasiga (Memory DB) o\'tilmoqda...');
    console.log('💡 Maslahat: MongoDB Atlas tarmog\'ida (Network Access) IP manzilingizga ruxsat berilganligini tekshiring (0.0.0.0/0).');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri);
      console.log('✅ [Memory DB] Ulanish muvaffaqiyatli! Ma\'lumotlar faqat server o\'chguncha saqlanadi.');
      
      const io = require('./socket').init(server);
      server.listen(PORT, () => {
        console.log(`🚀 Express Server (Memory DB) ishga tushdi: http://localhost:${PORT}`);
      });
    } catch (memError) {
      console.error('❌ [Memory DB Xatolik] Memory DB ga ham ulanib bo\'lmadi:', memError);
      process.exit(1);
    }
  });
