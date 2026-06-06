# 🚀 Complete Setup Guide - BarberBook MERN Application

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager

## 🏗️ Project Structure

```
barber-booking/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── CustomerDashboard.js
    │   │   ├── BarberDashboard.js
    │   │   ├── AdminDashboard.js
    │   │   ├── BookingPage.js
    │   │   ├── MyBookings.js
    │   │   ├── Services.js
    │   │   └── Barbers.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
``` 

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/barber-booking
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/barber-booking

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 5. Seed the Database (Optional but Recommended)
```bash
node seed.js
```

This will create:
- Demo users (customer, barber, admin)
- Sample services
- Sample bookings

### 6. Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The backend server will start on `http://localhost:5000`

### 7. Verify Backend
Open your browser and go to:
- `http://localhost:5000` - Should show API info
- `http://localhost:5000/api/health` - Should return health status

---

## 🎨 Frontend Setup

### 1. Open New Terminal & Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
```

### 4. Configure Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=BarberBook
REACT_APP_VERSION=1.0.0
```

### 5. Start Frontend Development Server
```bash
npm start
```

The frontend will start on `http://localhost:3000`

---

## 🔐 Demo Credentials

After seeding the database, use these credentials:

### Customer Account
- **Email:** customer@demo.com
- **Password:** demo123

### Barber Account
- **Email:** barber@demo.com
- **Password:** demo123

### Admin Account
- **Email:** admin@demo.com
- **Password:** demo123

---

## 📦 Package Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
node seed.js       # Seed database with sample data
```

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/barbers` - Get all barbers
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings (role-based)
- `GET /api/bookings/my-bookings` - Get current user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `DELETE /api/bookings/:id` - Delete booking (Admin)

### Dashboard
- `GET /api/dashboard/customer` - Customer dashboard stats
- `GET /api/dashboard/barber` - Barber dashboard stats
- `GET /api/dashboard/admin` - Admin dashboard stats

---

## 🧪 Testing the Application

### 1. Test Backend API
Using Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"demo123"}'
```

### 2. Test Frontend
1. Open `http://localhost:3000`
2. Click on any demo login button
3. Explore different dashboards
4. Try creating bookings

---

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --version

# Check MongoDB service status
# Windows
sc query MongoDB

# macOS/Linux
sudo systemctl status mongod
```

### Port Already in Use
```bash
# Backend (Port 5000)
# Kill process on Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on macOS/Linux
lsof -ti:5000 | xargs kill -9

# Frontend (Port 3000)
# Similar process for port 3000
```

### CORS Errors
- Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- Check that backend is running before starting frontend

### JWT Token Issues
- Make sure `JWT_SECRET` is set in `.env`
- Clear browser localStorage if tokens are invalid

---

## 📱 Features Checklist

- ✅ User Authentication (Login/Register)
- ✅ Role-Based Access Control (Customer/Barber/Admin)
- ✅ Service Management
- ✅ Booking System
- ✅ Dashboard Analytics
- ✅ Barber Profiles
- ✅ Booking Status Management
- ✅ Responsive Design (Tailwind CSS)

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Role-based authorization
- Input validation
- CORS protection

---

## 🌐 Deployment Tips

### Backend Deployment (Heroku/Render/Railway)
1. Set all environment variables
2. Use production MongoDB URI
3. Set `NODE_ENV=production`

### Frontend Deployment (Vercel/Netlify)
1. Update `REACT_APP_API_URL` to production backend URL
2. Build the application: `npm run build`
3. Deploy the `build` folder

---

## 📞 Support

For issues or questions:
1. Check the console logs for errors
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check that all dependencies are installed

---

## 🎉 You're All Set!

Your BarberBook application should now be running successfully!

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017/barber-booking

Happy coding! 💈✂️