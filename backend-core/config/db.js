const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.log('No MONGO_URI found, starting MongoMemoryServer...');
      const mongoServer = await MongoMemoryServer.create();
      mongoURI = mongoServer.getUri();
      console.log('MongoDB Memory Server using:', mongoURI);
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected ✅');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
