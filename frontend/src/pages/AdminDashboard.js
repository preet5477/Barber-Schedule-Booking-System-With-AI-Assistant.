import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    customerCount: 0,
    serviceCount: 0,
    income: 0,
    bookingCount: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedCustomer, dateFilter, customStartDate, customEndDate, bookings]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');

      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/bookings/all'),
      ]);

      console.log('Stats Response:', statsRes.data);
      console.log('Bookings Response:', bookingsRes.data);

      setStats(statsRes.data || {
        customerCount: 0,
        serviceCount: 0,
        income: 0,
        bookingCount: 0,
      });

      const bookingsData = bookingsRes.data.bookings || bookingsRes.data || [];
      console.log('Processed Bookings:', bookingsData);
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(b => b.status === selectedStatus);
    }

    // Customer filter
    if (selectedCustomer !== 'all') {
      filtered = filtered.filter(b => b.customer?._id === selectedCustomer);
    }

    // Date filter
    if (dateFilter !== 'all' && dateFilter !== 'custom') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        filtered = filtered.filter(b => {
          const bookingDate = new Date(b.bookingDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime();
        });
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter(b => new Date(b.bookingDate) >= weekAgo);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(b => new Date(b.bookingDate) >= monthAgo);
      }
    }

    // Custom date range filter
    if (dateFilter === 'custom' && customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    setFilteredBookings(filtered);
  };

  const resetFilters = () => {
    setSelectedStatus('all');
    setSelectedCustomer('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  if (loading) {
    return (
      <div>
        {/* <Navbar /> */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {/* <Navbar /> */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get unique customers for filter dropdown
  const uniqueCustomers = Array.from(
    new Set(bookings.map(b => b.customer?._id).filter(Boolean))
  ).map(id => bookings.find(b => b.customer?._id === id)?.customer);


const statusCounts = {
  pending: bookings.filter(b => b.status === 'pending').length,
  confirmed: bookings.filter(b => b.status === 'confirmed').length,
  completed: bookings.filter(b => b.status === 'completed').length,
  rejected: bookings.filter(b => b.status === 'rejected').length,
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Debug Info */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Total Bookings Loaded: {bookings.length} | 
            Filtered: {filteredBookings.length}
          </p>
        </div> */}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
            <h3 className="text-gray-600">Customers</h3>
            <p className="text-3xl font-bold">{stats.customerCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
            <h3 className="text-gray-600">Services</h3>
            <p className="text-3xl font-bold">{stats.serviceCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
            <h3 className="text-gray-600">Bookings</h3>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-600">
            <h3 className="text-gray-600">Income</h3>
            <p className="text-3xl font-bold">₹{stats.income || 0}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset All Filters
            </button>
          </div>

          {/* Status Filter Buttons */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-5 flex-wrap">
              {/* {['all', 'pending', 'accepted', 'completed', 'rejected'].map(status => ( */}
                {['all', 'pending', 'confirmed', 'completed', 'rejected'].map(status => (

                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} (
                  {status === 'all' ? bookings.length : statusCounts[status]})
                </button>
              ))}
            </div>
          </div>

          {/* Date and Customer Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Customers ({uniqueCustomers.length})</option>
                {uniqueCustomers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="w-full px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
                <span className="text-sm text-gray-600">Showing: </span>
                <span className="text-lg font-bold text-gray-800">
                  {filteredBookings.length}
                </span>
                <span className="text-sm text-gray-600"> bookings</span>
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Booking List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bookings</h2>

          {filteredBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              {bookings.length === 0 
                ? 'No bookings available in the system' 
                : 'No bookings found with the selected filters'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 text-left">Sno.</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Barber</th>
                    <th className="p-3 text-left">Services</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                
                <tbody>
                  {filteredBookings.map((b, idx) => (
                    <tr
                      key={b._id || idx}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{b.customer?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{b.customer?.email || ''}</div>
                        </div>
                      </td>
                      <td className="p-3">{b.barber?.name || 'N/A'}</td>
                      <td className="p-3">
                        {b.services && b.services.length > 0
                          ? b.services.map(s => s.service?.name || s.name || 'Unknown').join(', ')
                          : 'No services'}
                      </td>
                      <td className="p-3">
                        <div className="font-medium">
                          {new Date(b.bookingDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(b.bookingDate).toLocaleDateString('en-IN', {
                            weekday: 'short'
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        {b.startTime} - {b.endTime}
                      </td>
                      <td className="p-3 font-semibold">₹{b.totalAmount || 0}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          //   b.status === 'pending'
                          //     ? 'bg-yellow-100 text-yellow-800'
                          //     : b.status === 'accepted'
                          //     ? 'bg-green-100 text-green-800'
                          //     : b.status === 'completed'
                          //     ? 'bg-blue-100 text-blue-800'
                          //     : 'bg-red-100 text-red-800'
                          // }`}
                              b.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : b.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : b.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : b.status === 'cancelled'
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-red-100 text-red-800'
                                }`}
                        >
                          {/* {b.status} */}
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}

                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
