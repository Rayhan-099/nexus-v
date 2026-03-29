const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoURI = mongoServer.getUri();
    await mongoose.connect(mongoURI);
    console.log('MongoDB Memory Server Connected at', mongoURI);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
