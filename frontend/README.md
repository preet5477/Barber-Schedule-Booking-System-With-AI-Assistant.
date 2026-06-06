# 💈 BarberBook - Complete MERN Stack Application

A full-featured barber booking application built with MongoDB, Express, React, and Node.js, styled with Tailwind CSS.

## ⚡ Quick Start

### Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup (5 minutes)
```bash
cd backend
npm install
cp .env.example .env  # Edit with your MongoDB URI
node seed.js          # Seed demo data
npm run dev           # Start on port 5000
```

### Frontend Setup (3 minutes)
```bash
cd frontend
npm install
npm start             # Start on port 3000
```

### Access the App
Open http://localhost:3000 and login with:
- **Customer:** customer@demo.com / demo123
- **Barber:** barber@demo.com / demo123  
- **Admin:** admin@demo.com / demo123

## 📁 Complete File Structure

### Backend Files Provided:
```
backend/
├── models/
│   ├── User.js           ✅ User model with roles
│   ├── Service.js        ✅ Service model
│   └── Booking.js        ✅ Booking model with validations
├── routes/
│   ├── auth.js           ✅ Authentication routes
│   ├── users.js          ✅ User management routes
│   ├── services.js       ✅ Service CRUD routes
│   ├── bookings.js       ✅ Booking management routes
│   └── dashboard.js      ✅ Dashboard analytics routes
├── middleware/
│   └── auth.js           ✅ JWT authentication middleware
├── .env                  ✅ Environment variables
├── server.js             ✅ Express server setup
├── seed.js               ✅ Database seeder
└── package.json          ✅ Dependencies
```

### Frontend Files Provided:
```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.js              ✅ Navigation with Tailwind
│   ├── pages/
│   │   ├── Login.js               ✅ Login with backend integration
│   │   ├── Register.js            ✅ Registration with validation
│   │   ├── CustomerDashboard.js   ✅ Customer dashboard
│   │   ├── BarberDashboard.js     ✅ Barber dashboard
│   │   ├── AdminDashboard.js      ✅ Admin dashboard
│   │   ├── BookingPage.js         ✅ Booking form
│   │   ├── MyBookings.js          ✅ Booking management
│   │   ├── Services.js            ✅ Service catalog
│   │   └── Barbers.js             ✅ Barber profiles
│   ├── context/
│   │   └── AuthContext.js         ✅ Auth state with API
│   ├── services/
│   │   └── api.js                 ✅ Axios API service
│   ├── App.js                     ✅ Routes & protection
│   ├── index.js                   ✅ Entry point
│   └── index.css                  ✅ Tailwind setup
├── .env                            ✅ API URL config
├── tailwind.config.js              ✅ Tailwind config
├── postcss.config.js               ✅ PostCSS config
└── package.json                    ✅ Dependencies
```

## 🎯 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Customer/Barber/Admin)
- Protected routes
- Password hashing with bcrypt

### Customer Features
- Browse services and barbers
- Book appointments with real-time availability
- View and manage bookings
- Cancel appointments
- Dashboard with statistics

### Barber Features
- View upcoming appointments
- Manage appointment status (confirm/complete/cancel)
- Track daily schedule
- View earnings and statistics

### Admin Features
- Complete booking management
- User management (CRUD)
- Service management (CRUD)
- Dashboard with analytics
- Revenue tracking
- Popular services statistics

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `PUT /update-profile` - Update profile
- `PUT /change-password` - Change password

### Users (`/api/users`)
- `GET /` - Get all users (Admin)
- `GET /barbers` - Get all barbers (Public)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)
- `PUT /:id/toggle-availability` - Toggle barber availability

### Services (`/api/services`)
- `GET /` - Get all services
- `GET /categories` - Get service categories
- `GET /:id` - Get service by ID
- `POST /` - Create service (Admin)
- `PUT /:id` - Update service (Admin)
- `DELETE /:id` - Delete service (Admin)

### Bookings (`/api/bookings`)
- `GET /` - Get bookings (role-based)
- `GET /my-bookings` - Get user's bookings
- `GET /:id` - Get booking by ID
- `POST /` - Create booking
- `PUT /:id/status` - Update booking status
- `PUT /:id/cancel` - Cancel booking
- `DELETE /:id` - Delete booking (Admin)
- `GET /check-availability` - Check slot availability

### Dashboard (`/api/dashboard`)
- `GET /customer` - Customer dashboard stats
- `GET /barber` - Barber dashboard stats
- `GET /admin` - Admin dashboard stats
- `GET /stats/overview` - System overview stats

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Tailwind CSS v3** - Styling
- **Axios** - HTTP client
- **Context API** - State management

## 📦 Installation Scripts

### Install All Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Run Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 🗄️ Database Models

### User Model
- Name, Email, Password (hashed)
- Phone, Role (customer/barber/admin)
- Barber fields: specialty, experience, rating, reviews, availability
- Timestamps

### Service Model
- Name, Description, Price, Duration
- Category, Icon, Popularity
- Active status
- Timestamps

### Booking Model
- Customer, Barber, Service (references)
- Date, Time, Status (pending/confirmed/completed/cancelled)
- Notes, Cancellation details
- Completion timestamp
- Timestamps

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes
- Role-based authorization
- Input validation
- CORS protection
- MongoDB injection prevention

## 🎨 UI Features

- Fully responsive design (mobile-first)
- Modern gradient backgrounds
- Smooth transitions and animations
- Hover effects
- Loading states
- Error handling with user-friendly messages
- Clean and intuitive interface

## 📊 Dashboard Analytics

### Customer Dashboard
- Total bookings count
- Upcoming bookings
- Completed bookings
- Recent booking history

### Barber Dashboard
- Total appointments
- Pending appointments
- Today's schedule
- Completed bookings
- Total earnings

### Admin Dashboard
- User statistics (customers, barbers)
- Booking statistics (all statuses)
- Revenue tracking (total & monthly)
- Popular services
- Top barbers
- Booking trends (7-day chart)
- Recent bookings list

## 🚀 Deployment

### Backend (Heroku/Render/Railway)
1. Set environment variables
2. Use production MongoDB URI
3. Set `NODE_ENV=production`
4. Deploy

### Frontend (Vercel/Netlify)
1. Update `REACT_APP_API_URL` to production backend
2. Build: `npm run build`
3. Deploy `build` folder

## 📝 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"demo123"}'
```

### Test Frontend
1. Open http://localhost:3000
2. Use demo credentials to login
3. Test different user roles
4. Create and manage bookings

## 📖 Documentation

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 🤝 Contributing

This is a complete full-stack application ready for production use or further customization.

## 📄 License

Open source - Feel free to use for learning or commercial projects.

## 💡 Support

For questions or issues:
- Check console logs for errors
- Verify environment variables
- Ensure MongoDB is running
- Check that all dependencies are installed

---

**Built with ❤️ using MERN Stack + Tailwind CSS**

🌟 **Ready to use! Just install dependencies and run!** 🌟