const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const { auth, adminAuth } = require('../middleware/auth');

// Get dashboard stats
// router.get('/stats', auth, adminAuth, async (req, res) => {
//   try {
//     const { period = 'day' } = req.query;
    
//     let startDate = new Date();
//     startDate.setHours(0, 0, 0, 0);
    
//     if (period === 'week') {
//       startDate.setDate(startDate.getDate() - 7);
//     } else if (period === 'month') {
//       startDate.setMonth(startDate.getMonth() - 1);
//     }

//     // Count customers
//     const customerCount = await User.countDocuments({ role: 'customer' });
    
//     // Count services
//     const serviceCount = await Service.countDocuments({ isActive: true });
    
//     // Calculate income
//     const bookings = await Booking.find({
//       createdAt: { $gte: startDate },
//       status: 'completed'
//     });
     
//     const income = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    
//     // Bookings count
//     const bookingCount = await Booking.countDocuments({
//       createdAt: { $gte: startDate }
//     });

//     // Status wise count
//     const pendingCount = await Booking.countDocuments({ status: 'pending' });
//     const acceptedCount = await Booking.countDocuments({ status: 'accepted' });
//     const completedCount = await Booking.countDocuments({ status: 'completed' });
//     const rejectedCount = await Booking.countDocuments({ status: 'rejected' });

//     res.json({
//       customerCount,
//       serviceCount,
//       income,
//       bookingCount,
//       statusCounts: {
//         pending: pendingCount,
//         accepted: acceptedCount,
//         completed: completedCount,
//         rejected: rejectedCount
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Get income chart data
// router.get('/income-chart', auth, adminAuth, async (req, res) => {
//   try {
//     const { period = 'week' } = req.query;
    
//     let groupBy;
//     let startDate = new Date();
    
//     if (period === 'day') {
//       startDate.setHours(0, 0, 0, 0);
//       groupBy = { $hour: '$createdAt' };
//     } else if (period === 'week') {
//       startDate.setDate(startDate.getDate() - 7);
//       groupBy = { $dayOfWeek: '$createdAt' };
//     } else {
//       startDate.setMonth(startDate.getMonth() - 1);
//       groupBy = { $dayOfMonth: '$createdAt' };
//     }

//     const incomeData = await Booking.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startDate },
//           status: 'completed'
//         }
//       },
//       {
//         $group: {
//           _id: groupBy,
//           total: { $sum: '$totalAmount' },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     res.json(incomeData);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    
    if (period !== 'all') {
      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      if (period === 'today') {
        dateFilter = { createdAt: { $gte: startDate } };
      } else if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
        dateFilter = { createdAt: { $gte: startDate } };
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    // Count customers
    const customerCount = await User.countDocuments({ role: 'customer' });
    
    // Count services
    const serviceCount = await Service.countDocuments({ isActive: true });
    
    // Calculate income from completed bookings
    const completedBookings = await Booking.find({
      ...dateFilter,
      status: 'completed'
    });
     
    // const income = completedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    const income = completedBookings.reduce((sum, booking) => {
      console.log(`Adding booking amount: ${booking.totalAmount}`);
      return sum + (booking.totalAmount || 0);
    }, 0);
    console.log('Total Income:', income);
    // Total bookings count
    const bookingCount = await Booking.countDocuments(dateFilter);

    // Status wise count
    const pendingCount = await Booking.countDocuments({ status: 'pending' });
    const acceptedCount = await Booking.countDocuments({ status: 'accepted' });
    const completedCount = await Booking.countDocuments({ status: 'completed' });
    const rejectedCount = await Booking.countDocuments({ status: 'rejected' });

    console.log('Dashboard Stats:', {
      customerCount,
      serviceCount,
      income,
      bookingCount,
      statusCounts: { pendingCount, acceptedCount, completedCount, rejectedCount }
    });

    res.json({
      customerCount,
      serviceCount,
      income,
      bookingCount,
      statusCounts: {
        pending: pendingCount,
        accepted: acceptedCount,
        completed: completedCount,
        rejected: rejectedCount
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;