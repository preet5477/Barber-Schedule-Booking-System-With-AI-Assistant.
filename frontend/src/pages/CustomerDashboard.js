import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      const bookingsData = response.data.bookings || response.data;
      setBookings(bookingsData);
      
      // Calculate stats
      setStats({
        total: bookingsData.length,
        pending: bookingsData.filter(b => b.status === 'pending').length,
        accepted: bookingsData.filter(b => b.status === 'accepted').length,
        completed: bookingsData.filter(b => b.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="app-page">
        <div className="page-hero">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
            Booking Overview
          </p>
          <h1 className="page-title">Customer Dashboard</h1>
          <p className="page-subtitle">Welcome back. Track upcoming visits, booking status, and your grooming history in one clean view.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-2">Total Bookings</div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-2">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-2">Accepted</div>
            <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
          </div>
          <div className="stat-card">
            <div className="text-sm text-gray-600 mb-2">Completed</div>
            <div className="text-3xl font-bold text-blue-600">{stats.completed}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="surface-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/customer/book"
              className="primary-action"
            >
              Book New Appointment
            </Link>
            <Link
              to="/customer/bookings"
              className="secondary-action"
            >
              View All Bookings
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="surface-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No bookings yet</p>
                <Link
                  to="/customer/book"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Book your first appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.barber?.name || 'Unknown Barber'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {new Date(booking.bookingDate).toLocaleDateString()} at {booking.startTime}
                        </p>
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Services: </span>
                          {booking.services?.map((s, idx) => (
                            <span key={idx} className="text-sm font-medium">
                              {s.service?.name || s.name}{idx < booking.services.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <span className={`status-pill ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ₹{booking.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
