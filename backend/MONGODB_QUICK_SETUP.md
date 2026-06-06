# 🚀 MongoDB Quick Setup Guide - 5 Minutes

## Choose Your Setup Method

### ⚡ Option 1: MongoDB Atlas (Cloud - Easiest, No Installation)

**Perfect for:** Quick start, production deployment, no local setup needed

#### Step 1: Create Account (2 minutes)
```
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Verify email
```

#### Step 2: Create Cluster (1 minute)
```
1. Click "Build a Database"
2. Choose FREE tier (M0)
3. Select AWS + closest region
4. Name: BarberBookCluster
5. Click "Create"
```

#### Step 3: Setup Access (2 minutes)
```
1. Create Database User:
   - Username: barberbook_admin
   - Password: (save this!)
   - Role: Read and write to any database

2. Network Access:
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Confirm
```

#### Step 4: Get Connection String
```
1. Click "Connect" → "Connect your application"
2. Copy connection string
3. Replace <password> with your actual password
4. Add database name: /barber-booking

Final format:
mongodb+srv://barberbook_admin:yourpassword@barberbookcluster.xxxxx.mongodb.net/barber-booking?retryWrites=true&w=majority
```

#### Step 5: Update .env
```env
MONGODB_URI=mongodb+srv://barberbook_admin:yourpassword@barberbookcluster.xxxxx.mongodb.net/barber-booking?retryWrites=true&w=majority
```

✅ **Done! Skip to Step 7 (Test Connection)**

---

### 💻 Option 2: Local MongoDB (For Offline Development)

#### Windows Setup (5 minutes)

```bash
# Step 1: Download & Install
# Go to: https://www.mongodb.com/try/download/community
# Download MSI → Install → Choose "Complete"
# ✅ Check "Install MongoDB as a Service"
# ✅ Check "Install MongoDB Compass"

# Step 2: Verify Installation
mongod --version

# Step 3: Start MongoDB
net start MongoDB

# Step 4: Check Status
sc query MongoDB
# Should show: RUNNING
```

#### macOS Setup (5 minutes)

```bash
# Step 1: Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Step 2: Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Step 3: Start MongoDB
brew services start mongodb-community@7.0

# Step 4: Verify
brew services list | grep mongodb
# Should show: started
```

#### Linux (Ubuntu/Debian) Setup (5 minutes)

```bash
# Step 1: Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Step 2: Create list file
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Step 3: Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Step 4: Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Step 5: Verify
sudo systemctl status mongod
# Should show: active (running)
```

#### Update .env for Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/barber-booking
```

---

## 🧪 Step 7: Test Your Connection

### Test 1: Quick Test
```bash
cd backend
node test-connection.js
```

**Expected Output:**
```
✅ Connection Successful!
📊 Connection Details:
   Host: localhost (or cluster address)
   Database: barber-booking
   ✅ All Tests Passed Successfully!
```

### Test 2: Seed Database
```bash
node seed.js
```

**Expected Output:**
```
✅ Users seeded: 7
✅ Services seeded: 8
✅ Bookings seeded: 10
✅ Database seeding completed successfully!
```

### Test 3: Start Server
```bash
npm run dev
```

**Expected Output:**
```
🚀 BarberBook API Server Running
✅ MongoDB Connected Successfully!
📍 Server: http://localhost:5000
```

---

## 🔍 Troubleshooting

### Problem: "ECONNREFUSED"
**Solution:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community@7.0

# Linux
sudo systemctl start mongod
```

### Problem: "Authentication failed"
**Solution:**
- Check username/password in connection string
- Remove special characters from password
- For Atlas: Verify user in "Database Access"

### Problem: "MongoServerSelectionError"
**Solution:**
- For Atlas: Check "Network Access" IP whitelist
- Check internet connection
- Verify cluster is active

### Problem: "MONGODB_URI not defined"
**Solution:**
```bash
# Create .env file in backend folder
echo 'MONGODB_URI=mongodb://localhost:27017/barber-booking' > .env
```

---

## 📊 Verify Your Setup

### Check 1: MongoDB Running
```bash
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

### Check 2: Connect with Shell
```bash
# Local
mongosh

# Atlas
mongosh "your-connection-string"
```

### Check 3: View Database
```bash
mongosh
use barber-booking
show collections
db.users.countDocuments()
```

---

## 🎯 Final Checklist

- [ ] MongoDB installed/Atlas account created
- [ ] MongoDB service running
- [ ] .env file configured with MONGODB_URI
- [ ] test-connection.js passes
- [ ] Database seeded successfully
- [ ] Server starts without errors

---

## 🚀 Next Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Test Application:**
   - Open: http://localhost:3000
   - Login with: customer@demo.com / demo123

---

## 💡 Pro Tips

### Tip 1: Use MongoDB Compass (GUI)
```
- Download: https://www.mongodb.com/try/download/compass
- Connect: mongodb://localhost:27017
- Browse collections visually
```

### Tip 2: Backup Your Data
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/barber-booking" --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017/barber-booking" ./backup/barber-booking
```

### Tip 3: Monitor Connection
```javascript
// In your code, check connection status:
const { getConnectionStatus } = require('./config/database');
console.log('Status:', getConnectionStatus());
```

---

## 📱 Connection String Examples

### Local (Simple)
```
mongodb://localhost:27017/barber-booking
```

### Local (With Auth)
```
mongodb://admin:password@localhost:27017/barber-booking?authSource=admin
```

### Atlas (Standard)
```
mongodb+srv://username:password@cluster.mongodb.net/barber-booking?retryWrites=true&w=majority
```

### Multiple Hosts (Replica Set)
```
mongodb://host1:27017,host2:27017,host3:27017/barber-booking?replicaSet=myReplicaSet
```

---

## 🆘 Need Help?

1. **Check Logs:**
   ```bash
   # Windows
   type "C:\Program Files\MongoDB\Server\7.0\log\mongodb.log"
   
   # macOS/Linux
   tail -f /usr/local/var/log/mongodb/mongo.log
   ```

2. **MongoDB Status:**
   ```bash
   mongosh
   db.adminCommand({ serverStatus: 1 })
   ```

3. **Resources:**
   - MongoDB Docs: https://docs.mongodb.com/
   - Atlas Help: https://docs.atlas.mongodb.com/
   - Community: https://community.mongodb.com/

---

**🎉 You're Ready! Your MongoDB is set up and connected!**

Total Setup Time: 5-10 minutes ⏱️