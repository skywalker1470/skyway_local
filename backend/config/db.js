const mongoose = require('mongoose');
require('dotenv').config();

// Enable debug logging
mongoose.set('debug', true);

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI ? 'Found' : 'MISSING!');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected to database:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('Port:', conn.connection.port);
    
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Error details:', {
      name: err.name,
      code: err.code,
      codeName: err.codeName,
      reason: err.reason
    });
    process.exit(1);
  }
};

module.exports = connectDB;
