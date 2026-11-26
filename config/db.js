const mongoose = require('mongoose');

async function connectDB() {
  const connectionString = process.env.MONGODB_URI;
  if (!connectionString || connectionString === 'your_mongodb_connection_string') {
    throw new Error('MONGODB_URI is missing. Add your MongoDB connection string to backend/.env.');
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  await mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
