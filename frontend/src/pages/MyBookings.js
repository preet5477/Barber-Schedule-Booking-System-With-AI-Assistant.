import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { showError } from '../utils/alerts';

const tabs = ['all', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled'];

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.role]);

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const endpoint = user?.role === 'barber'
        ? '/bookings/barber-bookings'
        : '/bookings/my-bookings';

      const response = await api.get(endpoint);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || response.data.data || [];

      setBookings(data);
    } catch (error) {
      setBookings([]);
      showError('Could not load bookings', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted':
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-900" />
          <p className="text-stone-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="page-hero flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-900 dark:text-red-300">
            Appointment History
          </p>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            Track upcoming visits, completed services, and appointment status.
          </p>
        </div>
        <div className="barber-metric min-w-[150px] text-center">
          <p className="text-3xl font-black text-red-900 dark:text-red-300">{bookings.length}</p>
          <p className="text-sm text-stone-500">Total bookings</p>
        </div>
      </div>

      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`barber-tab ${filter === tab ? 'barber-tab-active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="surface-card py-12 text-center">
          <p className="text-lg font-bold text-stone-700 dark:text-stone-200">
            {bookings.length === 0 ? 'No bookings found' : `No ${filter} bookings found`}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            New appointments will appear here after booking.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredBookings.map((booking) => (
            <article key={booking._id} className="surface-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-black text-stone-950 dark:text-white">
                    Booking #{String(booking._id).slice(-6)}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`status-pill border ${getStatusColor(booking.status)}`}>
                  {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                </span>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4 dark:bg-neutral-950">
                  <p className="text-xs font-black uppercase tracking-wide text-stone-400">
                    {user?.role === 'barber' ? 'Customer' : 'Barber'}
                  </p>
                  <p className="mt-1 font-black text-stone-950 dark:text-white">
                    {user?.role === 'barber'
                      ? booking.customer?.name || 'N/A'
                      : typeof booking.barber === 'object'
                      ? booking.barber?.name || 'N/A'
                      : 'Assigned barber'}
                  </p>
                  <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
                    {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="text-sm text-stone-500">
                    Duration: {booking.totalDuration || 0} minutes
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4 dark:bg-neutral-950">
                  <p className="text-xs font-black uppercase tracking-wide text-stone-400">
                    Services
                  </p>
                  <div className="mt-3 space-y-2">
                    {(booking.services || []).map((serviceItem, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm dark:bg-neutral-900">
                        <span>{serviceItem.service?.name || serviceItem.serviceName || serviceItem.name || 'Service'}</span>
                        <span className="font-black">Rs.{serviceItem.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 dark:border-neutral-800">
                    <span className="font-black">Total</span>
                    <span className="text-2xl font-black text-red-900 dark:text-red-300">Rs.{booking.totalAmount || 0}</span>
                  </div>
                </div>
              </div>

              {booking.rejectionReason && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <strong>Rejection reason:</strong> {booking.rejectionReason}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
