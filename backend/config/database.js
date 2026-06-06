// // backend/config/database.js
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     console.log('🔄 Attempting to connect to MongoDB...');
//     console.log('📍 Connecting to:', process.env.MONGODB_URI.replace(/\/\/.*:(.*)@/, '//****:****@')); // hide password in logs

//     await mongoose.connect(process.env.MONGODB_URI);

//     console.log('✅ MongoDB connected successfully!');
//   } catch (error) {
//     console.error('❌ MongoDB Connection Failed!');
//     console.error('📝 Error Details:');
//     console.error('   - Message:', error.message);
//     console.error('   - Code:', error.code);
//     process.exit(1);
//   }
// };

// // Handle connection events
// mongoose.connection.on('disconnected', () => {
//   console.warn('⚠️ Mongoose disconnected from MongoDB');
// });

// module.exports = { connectDB };

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Database:', process.env.MONGODB_URI ? 'MongoDB Atlas Cloud' : 'Not configured');

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(' MongoDB Atlas connected successfully!');
    console.log('----------------------------------------');
    console.log(' Connection Details:');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log('-------------------------------------------');
    
    // Show collections after a brief delay
    setTimeout(async () => {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📦 Collections in database:');
        if (collections.length > 0) {
          collections.forEach(col => console.log(`   - ${col.name}`));
        } else {
          console.log('   No collections yet (will be created on first insert)');
        }
        console.log('-------------------------------------------\n');
      } catch (err) {
        console.log('   Could not list collections');
      }
    }, 1000);

  } catch (error) {
    console.error(' MongoDB Atlas Connection Failed!');
    console.error(' Error Details:');
    console.error('   - Message:', error.message);
    console.error('   - Code:', error.code);
    console.error('\n Troubleshooting:');
    console.error('   1. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('   2. Verify username and password are correct');
    console.error('   3. Ensure database name is correct');
    console.error('   4. Check network connectivity\n');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log(' Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('disconnected', () => {
  console.warn(' Mongoose disconnected from MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error(' Mongoose connection error:', err);
});

module.exports = connectDB;