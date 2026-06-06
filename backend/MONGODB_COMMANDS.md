# 📚 MongoDB Commands Reference for BarberBook

## 🔌 Connection Commands

### Connect to Local MongoDB
```bash
# Simple connection
mongosh

# Connect to specific database
mongosh "mongodb://localhost:27017/barber-booking"

# Connect with authentication
mongosh "mongodb://username:password@localhost:27017/barber-booking"
```

### Connect to MongoDB Atlas
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/barber-booking"
```

### Exit MongoDB Shell
```bash
exit
# or
quit()
```

---

## 📊 Database Commands

### Show All Databases
```javascript
show dbs
// or
show databases
```

### Switch/Create Database
```javascript
use barber-booking
```

### Show Current Database
```javascript
db
```

### Delete Database
```javascript
db.dropDatabase()
// ⚠️ This will delete all data!
```

### Database Statistics
```javascript
db.stats()
```

---

## 📁 Collection Commands

### Show All Collections
```javascript
show collections
```

### Create Collection
```javascript
db.createCollection("users")
db.createCollection("services")
db.createCollection("bookings")
```

### Drop Collection
```javascript
db.users.drop()
// ⚠️ This will delete all documents in the collection!
```

### Collection Statistics
```javascript
db.users.stats()
```

---

## 📝 CRUD Operations

### Create (Insert) Documents

#### Insert One Document
```javascript
// Insert a user
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  password: "hashedpassword",
  phone: "1234567890",
  role: "customer",
  createdAt: new Date(),
  updatedAt: new Date()
})

// Insert a service
db.services.insertOne({
  name: "Classic Haircut",
  description: "Traditional men's haircut",
  price: 20,
  duration: "30 min",
  category: "haircut",
  icon: "✂️",
  isActive: true,
  popularity: 0
})
```

#### Insert Multiple Documents
```javascript
db.users.insertMany([
  {
    name: "Alice Smith",
    email: "alice@example.com",
    password: "hashedpass",
    phone: "9876543210",
    role: "barber"
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    password: "hashedpass",
    phone: "5555555555",
    role: "customer"
  }
])
```

### Read (Find) Documents

#### Find All Documents
```javascript
db.users.find()

// Pretty print
db.users.find().pretty()

// Limit results
db.users.find().limit(5)

// Sort results (1 = ascending, -1 = descending)
db.users.find().sort({ createdAt: -1 })
```

#### Find One Document
```javascript
db.users.findOne({ email: "customer@demo.com" })
```

#### Find with Conditions
```javascript
// Find by role
db.users.find({ role: "customer" })

// Find barbers who are available
db.users.find({ role: "barber", available: true })

// Find services in a category
db.services.find({ category: "haircut" })

// Find bookings by status
db.bookings.find({ status: "confirmed" })

// Find with multiple conditions (AND)
db.bookings.find({ 
  status: "pending", 
  date: { $gte: new Date() } 
})

// Find with OR condition
db.users.find({ 
  $or: [
    { role: "barber" }, 
    { role: "admin" }
  ] 
})
```

#### Find with Operators
```javascript
// Greater than (price > 20)
db.services.find({ price: { $gt: 20 } })

// Greater than or equal (price >= 20)
db.services.find({ price: { $gte: 20 } })

// Less than (price < 30)
db.services.find({ price: { $lt: 30 } })

// Not equal
db.users.find({ role: { $ne: "customer" } })

// In array
db.bookings.find({ status: { $in: ["pending", "confirmed"] } })

// Regex pattern
db.users.find({ email: { $regex: /demo/ } })
db.users.find({ name: { $regex: /^John/, $options: "i" } }) // case insensitive
```

#### Projection (Select Specific Fields)
```javascript
// Include only specific fields (1 = include)
db.users.find({}, { name: 1, email: 1, role: 1 })

// Exclude specific fields (0 = exclude)
db.users.find({}, { password: 0 })
```

### Update Documents

#### Update One Document
```javascript
// Update user's phone number
db.users.updateOne(
  { email: "customer@demo.com" },
  { $set: { phone: "9999999999" } }
)

// Increment a value
db.services.updateOne(
  { name: "Classic Haircut" },
  { $inc: { popularity: 1 } }
)

// Update multiple fields
db.users.updateOne(
  { email: "barber@demo.com" },
  { 
    $set: { 
      available: true,
      rating: 4.8,
      updatedAt: new Date()
    } 
  }
)
```

#### Update Many Documents
```javascript
// Make all barbers available
db.users.updateMany(
  { role: "barber" },
  { $set: { available: true } }
)

// Update all pending bookings to confirmed
db.bookings.updateMany(
  { status: "pending" },
  { $set: { status: "confirmed" } }
)
```

#### Replace Document
```javascript
db.users.replaceOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  {
    name: "New Name",
    email: "new@email.com",
    // ... complete document
  }
)
```

### Delete Documents

#### Delete One Document
```javascript
db.users.deleteOne({ email: "test@example.com" })
```

#### Delete Many Documents
```javascript
// Delete all cancelled bookings
db.bookings.deleteMany({ status: "cancelled" })

// Delete old completed bookings (older than 6 months)
const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

db.bookings.deleteMany({ 
  status: "completed",
  completedAt: { $lt: sixMonthsAgo }
})
```

#### Delete All Documents in Collection
```javascript
db.users.deleteMany({})
// ⚠️ This deletes everything but keeps the collection
```

---

## 🔢 Aggregation Commands

### Count Documents
```javascript
// Count all users
db.users.countDocuments()

// Count with condition
db.users.countDocuments({ role: "customer" })

// Count bookings by status
db.bookings.countDocuments({ status: "confirmed" })
```

### Aggregation Pipeline
```javascript
// Count users by role
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])

// Get total revenue from completed bookings
db.bookings.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$servicePrice" } } }
])

// Get most popular services
db.bookings.aggregate([
  { $match: { status: { $in: ["confirmed", "completed"] } } },
  { $group: { _id: "$serviceName", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 }
])

// Get barber statistics
db.bookings.aggregate([
  { $match: { status: "completed" } },
  { 
    $group: { 
      _id: "$barber",
      totalBookings: { $sum: 1 },
      totalRevenue: { $sum: "$servicePrice" },
      barberName: { $first: "$barberName" }
    } 
  },
  { $sort: { totalBookings: -1 } }
])
```

### Distinct Values
```javascript
// Get all unique categories
db.services.distinct("category")

// Get all unique roles
db.users.distinct("role")

// Get all booking statuses
db.bookings.distinct("status")
```

---

## 🔍 Index Commands

### View Indexes
```javascript
db.users.getIndexes()
db.services.getIndexes()
db.bookings.getIndexes()
```

### Create Index
```javascript
// Single field index
db.users.createIndex({ email: 1 })

// Compound index
db.bookings.createIndex({ barber: 1, date: -1 })

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Text index for search
db.services.createIndex({ name: "text", description: "text" })
```

### Drop Index
```javascript
db.users.dropIndex("email_1")
```

---

## 👥 User Management Commands

### Create Database User
```javascript
use admin

db.createUser({
  user: "barberbook_admin",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "barber-booking" }
  ]
})
```

### Show Users
```javascript
use admin
db.getUsers()
```

### Drop User
```javascript
use admin
db.dropUser("username")
```

---

## 🔧 Utility Commands

### Server Status
```javascript
db.adminCommand({ serverStatus: 1 })
```

### Database Version
```javascript
db.version()
```

### Current Operations
```javascript
db.currentOp()
```

### Kill Operation
```javascript
db.killOp(opId)
```

### Repair Database
```javascript
db.repairDatabase()
```

---

## 📊 BarberBook Specific Queries

### Get All Customers
```javascript
db.users.find({ role: "customer" }, { name: 1, email: 1, phone: 1 })
```

### Get All Available Barbers
```javascript
db.users.find({ 
  role: "barber", 
  available: true 
}).sort({ rating: -1 })
```

### Get Today's Bookings
```javascript
const today = new Date()
today.setHours(0, 0, 0, 0)

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

db.bookings.find({
  date: { $gte: today, $lt: tomorrow }
}).sort({ time: 1 })
```

### Get Upcoming Bookings for a Customer
```javascript
db.bookings.find({
  customer: ObjectId("your-customer-id"),
  date: { $gte: new Date() },
  status: { $in: ["pending", "confirmed"] }
}).sort({ date: 1, time: 1 })
```

### Get Barber's Schedule for a Date
```javascript
db.bookings.find({
  barber: ObjectId("your-barber-id"),
  date: ISODate("2024-01-15"),
  status: { $in: ["pending", "confirmed"] }
}).sort({ time: 1 })
```

### Get Most Popular Services
```javascript
db.services.find({ isActive: true }).sort({ popularity: -1 }).limit(5)
```

### Get Monthly Revenue
```javascript
const firstDayOfMonth = new Date()
firstDayOfMonth.setDate(1)
firstDayOfMonth.setHours(0, 0, 0, 0)

db.bookings.aggregate([
  {
    $match: {
      status: "completed",
      completedAt: { $gte: firstDayOfMonth }
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$servicePrice" },
      totalBookings: { $sum: 1 }
    }
  }
])
```

### Get Top Barbers by Bookings
```javascript
db.bookings.aggregate([
  { $match: { status: "completed" } },
  { 
    $group: { 
      _id: "$barber",
      barberName: { $first: "$barberName" },
      totalBookings: { $sum: 1 },
      totalRevenue: { $sum: "$servicePrice" }
    } 
  },
  { $sort: { totalBookings: -1 } },
  { $limit: 5 }
])
```

---

## 🧹 Cleanup Commands

### Delete Old Cancelled Bookings
```javascript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

db.bookings.deleteMany({
  status: "cancelled",
  createdAt: { $lt: thirtyDaysAgo }
})
```

### Reset Database (Delete All Data)
```javascript
db.users.deleteMany({})
db.services.deleteMany({})
db.bookings.deleteMany({})
```

---

## 💾 Backup & Restore

### Backup Database
```bash
# From terminal, not mongosh
mongodump --uri="mongodb://localhost:27017/barber-booking" --out=./backup
```

### Restore Database
```bash
# From terminal, not mongosh
mongorestore --uri="mongodb://localhost:27017/barber-booking" ./backup/barber-booking
```

### Export Collection to JSON
```bash
mongoexport --uri="mongodb://localhost:27017/barber-booking" --collection=users --out=users.json
```

### Import Collection from JSON
```bash
mongoimport --uri="mongodb://localhost:27017/barber-booking" --collection=users --file=users.json
```

---

## 🎯 Quick Tips

1. **Always use .pretty()** for readable output:
   ```javascript
   db.users.find().pretty()
   ```

2. **Use .explain()** to analyze query performance:
   ```javascript
   db.users.find({ email: "test@email.com" }).explain("executionStats")
   ```

3. **Use projections** to limit returned data:
   ```javascript
   db.users.find({}, { password: 0 }) // Exclude password
   ```

4. **Create indexes** for frequently queried fields:
   ```javascript
   db.bookings.createIndex({ date: 1, status: 1 })
   ```

5. **Use aggregation** for complex queries and statistics

---

**📚 Bookmark this guide for quick reference!**