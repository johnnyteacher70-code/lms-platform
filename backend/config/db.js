const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // MongoDB Memory Server operativ xotirada MongoDB bazasini yaratib beradi.
    // Noutbukka o'rnatish shart emas!
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    console.log(`[MongoDB] Muvaffaqiyatli ulandi (In-Memory)!`);
    console.log(`Aloqa manzili: ${uri}`);
  } catch (error) {
    console.error('[MongoDB Xatolik]', error);
    process.exit(1);
  }
};

module.exports = connectDB;
