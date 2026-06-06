import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import BarberDashboard from './pages/BarberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import Services from './pages/Services';
import Barbers from './pages/Barbers';
import AIChat from './pages/AIChat';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;  // Changed to match Navbar
    } else if (user.role === 'barber') {
      return <Navigate to="/barber/dashboard" replace />;  // Changed to match Navbar
    } else {
      return <Navigate to="/customer/dashboard" replace />;  // Changed to match Navbar
    }
  }

  return children;
};

// Home Route Component
const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;  // Changed
  } else if (user.role === 'barber') {
    return <Navigate to="/barber/dashboard" replace />;  // Changed
  } else {
    return <Navigate to="/customer/dashboard" replace />;  // Changed
  }
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div
        className={`App min-h-screen text-stone-950 transition-colors duration-300 dark:text-stone-100 ${
          isAuthenticated
            ? 'lg:pr-64'
            : ''
        }`}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Customer Routes - Updated paths to match Navbar */}
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/book" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/bookings" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/customer/services" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/customer/barbers" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Barbers />
            </ProtectedRoute>
          } />

          {/* Barber Routes - Updated path to match Navbar */}
          <Route path="/barber/dashboard" element={
            <ProtectedRoute allowedRoles={['barber']}>
              <BarberDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes -  Updated paths to match Navbar */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/admin/barbers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Barbers />
            </ProtectedRoute>
          } />

          {/* Preet12052026 */}

          <Route path="/ai-chat" element={<AIChat />} /> 

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
