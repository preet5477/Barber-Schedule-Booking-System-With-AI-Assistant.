const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testConnection = async () => {
  try {
    log('\n╔════════════════════════════════════════════╗', 'bright');
    log('║   🧪 MongoDB Connection Test               ║', 'bright');
    log('╚════════════════════════════════════════════╝\n', 'bright');
    
    // Check if MongoDB URI is set
    if (!process.env.MONGODB_URI) {
      log('❌ Error: MONGODB_URI is not defined in .env file', 'red');
      log('\n💡 Solution:', 'yellow');
      log('   1. Create a .env file in the backend directory', 'bright');
      log('   2. Add: MONGODB_URI=mongodb://localhost:27017/barber-booking', 'bright');
      log('   3. Or use MongoDB Atlas connection string', 'bright');
      process.exit(1);
    }
    
    // Display sanitized URI
    const sanitizedURI = process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@');
    log('📍 Connection URI:', 'cyan');
    log(`   ${sanitizedURI}\n`, 'bright');
    
    log('🔄 Attempting to connect...', 'yellow');
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    };
    
    // Start timer
    const startTime = Date.now();
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    // Calculate connection time
    const connectionTime = Date.now() - startTime;
    
    log('✅ Connection Successful!\n', 'green');
    
    // Display connection details
    log('📊 Connection Details:', 'blue');
    log('═══════════════════════════════════════════', 'blue');
    log(`   Host: ${mongoose.connection.host}`, 'bright');
    log(`   Database: ${mongoose.connection.name}`, 'bright');
    log(`   Port: ${mongoose.connection.port || 'N/A (using SRV)'}`, 'bright');
    log(`   Connection Time: ${connectionTime}ms`, 'bright');
    
    // Check connection state
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    log(`   State: ${states[mongoose.connection.readyState]}`, 'bright');
    
    // Test database operations
    log('\n🔧 Testing Database Operations:', 'blue');
    log('═══════════════════════════════════════════', 'blue');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    log(`   Total Databases: ${dbs.databases.length}`, 'bright');
    log(`   Your Database Size: ${(dbs.databases.find(db => db.name === mongoose.connection.name)?.sizeOnDisk || 0) / 1024 / 1024} MB`, 'bright');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`   Collections: ${collections.length}`, 'bright');
    
    if (collections.length > 0) {
      log('   Collection Names:', 'bright');
      collections.forEach(col => {
        log(`      - ${col.name}`, 'cyan');
      });
      
      // Count documents in each collection
      log('\n   Document Counts:', 'bright');
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        log(`      - ${col.name}: ${count} documents`, 'cyan');
      }
    } else {
      log('      No collections found (database is empty)', 'yellow');
      log('      Run: node seed.js to populate the database', 'yellow');
    }
    
    // Check indexes
    log('\n📑 Checking Indexes:', 'blue');
    if (collections.length > 0) {
      for (const col of collections) {
        const indexes = await mongoose.connection.db.collection(col.name).indexes();
        log(`   ${col.name}: ${indexes.length} indexes`, 'bright');
      }
    } else {
      log('   No collections to check', 'yellow');
    }
    
    // Connection health check
    log('\n💊 Connection Health Check:', 'blue');
    log('═══════════════════════════════════════════', 'blue');
    
    try {
      await mongoose.connection.db.admin().ping();
      log('   Database Ping: ✅ Success', 'green');
    } catch (pingError) {
      log('   Database Ping: ❌ Failed', 'red');
    }
    
    // Display server info
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    log(`   MongoDB Version: ${serverStatus.version}`, 'bright');
    log(`   Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`, 'bright');
    log(`   Connections: ${serverStatus.connections.current} current`, 'bright');
    
    // Success summary
    log('\n╔════════════════════════════════════════════╗', 'green');
    log('║   ✅ All Tests Passed Successfully!       ║', 'green');
    log('╚════════════════════════════════════════════╝\n', 'green');
    
    log('🚀 Next Steps:', 'bright');
    log('   1. If database is empty, run: node seed.js', 'cyan');
    log('   2. Start the server: npm run dev', 'cyan');
    log('   3. Test API endpoints: http://localhost:5000/api/health\n', 'cyan');
    
    // Disconnect
    await mongoose.disconnect();
    log('👋 Disconnected from MongoDB', 'yellow');
    
    process.exit(0);
  } catch (error) {
    log('\n❌ Connection Test Failed!', 'red');
    log('═══════════════════════════════════════════\n', 'red');
    
    log('📝 Error Details:', 'red');
    log(`   Message: ${error.message}`, 'bright');
    log(`   Code: ${error.code || 'N/A'}`, 'bright');
    
    // Provide helpful troubleshooting tips
    log('\n💡 Troubleshooting Tips:', 'yellow');
    
    if (error.message.includes('ECONNREFUSED')) {
      log('   ❌ Connection Refused', 'red');
      log('   ✅ Solutions:', 'green');
      log('      1. Make sure MongoDB is running locally', 'bright');
      log('      2. Check if MongoDB service is started:', 'bright');
      log('         Windows: net start MongoDB', 'cyan');
      log('         macOS: brew services start mongodb-community', 'cyan');
      log('         Linux: sudo systemctl start mongod', 'cyan');
      log('      3. Verify MongoDB is listening on port 27017', 'bright');
      
    } else if (error.message.includes('authentication failed')) {
      log('   ❌ Authentication Failed', 'red');
      log('   ✅ Solutions:', 'green');
      log('      1. Check username and password in connection string', 'bright');
      log('      2. Verify user exists in MongoDB', 'bright');
      log('      3. Check if user has correct permissions', 'bright');
      
    } else if (error.message.includes('MongoServerSelectionError')) {
      log('   ❌ Server Selection Error', 'red');
      log('   ✅ Solutions:', 'green');
      log('      1. Check your internet connection', 'bright');
      log('      2. Verify MongoDB Atlas cluster is running', 'bright');
      log('      3. Check IP whitelist in MongoDB Atlas', 'bright');
      log('      4. Verify connection string format', 'bright');
      
    } else if (error.message.includes('MONGODB_URI')) {
      log('   ❌ Configuration Error', 'red');
      log('   ✅ Solutions:', 'green');
      log('      1. Create .env file in backend directory', 'bright');
      log('      2. Add MONGODB_URI variable', 'bright');
      log('      3. Example: MONGODB_URI=mongodb://localhost:27017/barber-booking', 'bright');
      
    } else {
      log('   ❌ Unknown Error', 'red');
      log('   ✅ General Solutions:', 'green');
      log('      1. Check MongoDB installation', 'bright');
      log('      2. Verify connection string format', 'bright');
      log('      3. Check firewall settings', 'bright');
      log('      4. Review MongoDB logs for details', 'bright');
    }
    
    log('\n📚 Additional Resources:', 'blue');
    log('   - MongoDB Docs: https://docs.mongodb.com/', 'cyan');
    log('   - Connection String: https://docs.mongodb.com/manual/reference/connection-string/', 'cyan');
    log('   - Troubleshooting: https://docs.mongodb.com/manual/faq/', 'cyan');
    
    console.error('\n🔍 Full Error Stack:');
    console.error(error);
    
    process.exit(1);
  }
};

// Run test
testConnection();