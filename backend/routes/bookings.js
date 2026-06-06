// const express = require('express');
// const router = express.Router();
// const Booking = require('../models/Booking');
// const Service = require('../models/Service');
// const User = require('../models/User');
// const { auth, barberAuth } = require('../middleware/auth');
// const { auth, adminAuth } = require('../middleware/auth');
// // ===========================
// // CREATE BOOKING
// // ===========================
// router.post('/', auth, async (req, res) => {
//   try {
//     const { barber, services, bookingDate, startTime } = req.body;

//     let totalAmount = 0;
//     let totalDuration = 0;
//     const serviceDetails = [];

//     for (let serviceId of services) {
//       const service = await Service.findById(serviceId);
//       if (!service) continue;

//       const numericDuration = parseInt(service.duration);
//       totalAmount += Number(service.price);
//       totalDuration += numericDuration;

//       serviceDetails.push({
//         service: service._id,
//         price: Number(service.price),
//         duration: numericDuration,
//       });
//     }

//     const [hours, minutes] = startTime.split(':');
//     const endDate = new Date();
//     endDate.setHours(parseInt(hours), parseInt(minutes) + totalDuration);
//     const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate
//       .getMinutes()
//       .toString()
//       .padStart(2, '0')}`;

//     const booking = new Booking({
//       customer: req.userId,
//       barber,
//       services: serviceDetails,
//       bookingDate,
//       startTime,
//       endTime,
//       totalAmount,
//       totalDuration,
//     });

//     await booking.save();
//     await booking.populate('customer barber services.service');

//     res.status(201).json(booking);
//   } catch (error) {
//     console.error('❌ Error creating booking:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // ===========================
// // GET BOOKINGS
//   
// router.get('/my-bookings', auth, async (req, res) => {
//   try {
//     const query =
//       req.userRole === 'admin'
//         ? {}
//         : { $or: [{ customer: req.userId }, { barber: req.userId }] };

//     const bookings = await Booking.find(query)
//       .populate('customer barber', 'name email phone')
//       .populate('services.service', 'name price')
//       .sort({ bookingDate: -1 });

//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching bookings:', error);
//     res.status(500).json({ message: 'Server error fetching bookings' });
//   }
// });

//   
// // GET BARBER BOOKINGS
//   
// router.get('/barber-bookings', auth, barberAuth, async (req, res) => {
//   try {
//     const bookings = await Booking.find({ barber: req.userId })
//       .populate('customer', 'name email phone')
//       .populate('services.service')
//       .sort({ bookingDate: 1, startTime: 1 });

//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching barber bookings:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

//   
// // GET ALL BOOKINGS (Admin)
//   
// router.get('/all', auth, async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate('customer barber', 'name email phone')
//       .populate('services.service')
//       .sort({ bookingDate: 1, startTime: 1 });

//     res.json(bookings);
//   } catch (error) {
//     console.error('Error fetching all bookings:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

//   
// // GET AVAILABLE TIME SLOTS
//   
// router.get('/available-slots/:barberId/:date', async (req, res) => {
//   try {
//     const { barberId, date } = req.params;
    
//     console.log('📅 Fetching available slots for:', { barberId, date });

//     // Define working hours (9 AM to 6 PM)
//     const startHour = 9;
//     const endHour = 18;
//     const slotDuration = 30; // 30 minutes per slot

//     // Get existing bookings for this barber on this date
//     const startOfDay = new Date(date);
//     startOfDay.setHours(0, 0, 0, 0);
    
//     const endOfDay = new Date(date);
//     endOfDay.setHours(23, 59, 59, 999);

//     const existingBookings = await Booking.find({
//       barber: barberId,
//       bookingDate: {
//         $gte: startOfDay,
//         $lte: endOfDay
//       },
//       status: { $nin: ['cancelled', 'rejected'] }
//     }).select('startTime endTime');

//     console.log('📋 Found existing bookings:', existingBookings.length);

//     // Generate all possible time slots
//     const slots = [];
//     for (let hour = startHour; hour < endHour; hour++) {
//       for (let minute = 0; minute < 60; minute += slotDuration) {
//         const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
//         // Check if this slot is already booked
//         const isBooked = existingBookings.some(booking => {
//           if (!booking.startTime || !booking.endTime) return false;
          
//           // Check if the slot overlaps with any booking
//           const slotStart = timeString;
//           const [slotHour, slotMin] = timeString.split(':').map(Number);
//           const slotEndDate = new Date();
//           slotEndDate.setHours(slotHour, slotMin + slotDuration, 0, 0);
//           const slotEnd = `${slotEndDate.getHours().toString().padStart(2, '0')}:${slotEndDate.getMinutes().toString().padStart(2, '0')}`;
          
//           // A slot is booked if it overlaps with any existing booking
//           return (
//             (slotStart >= booking.startTime && slotStart < booking.endTime) ||
//             (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
//             (slotStart <= booking.startTime && slotEnd >= booking.endTime)
//           );
//         });

//         slots.push({
//           time: timeString,
//           available: !isBooked
//         });
//       }
//     }

//     console.log('✅ Generated slots:', slots.length, 'Available:', slots.filter(s => s.available).length);
//     res.json(slots);
//   } catch (error) {
//     console.error('❌ Error fetching available slots:', error);
//     res.status(500).json({ 
//       message: 'Error fetching available slots', 
//       error: error.message 
//     });
//   }
// });

//   
// // UPDATE BOOKING STATUS (Confirm / Cancel / Complete)
//   
// router.patch('/:id/status', auth, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const booking = await Booking.findById(req.params.id).populate('barber');

//     if (!booking) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//     // ✅ Debug logging (INSIDE the route handler)
//     console.log("UserId from token:", req.userId);
//     console.log("UserRole:", req.userRole);
//     console.log("Booking Barber ID:", booking.barber?._id?.toString());

//     // Permission check (barber or admin)
//     const barberId = booking.barber?._id?.toString();
//     if (req.userRole !== 'admin' && barberId !== req.userId) {
//       return res
//         .status(403)
//         .json({ success: false, message: 'Not authorized to update this booking' });
//     }

//     booking.status = status || booking.status;
//     await booking.save();
//     await booking.populate('customer barber services.service');

//     res.json({
//       success: true,
//       message: 'Booking updated successfully',
//       booking,
//     });
//   } catch (error) {
//     console.error('❌ Error updating booking status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error updating booking',
//       error: error.message,
//     });
//   }
// });


// // Get all bookings (Admin)
// router.get('/all', auth, adminAuth, async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate('customer', 'name email phone')
//       .populate('barber', 'name email')
//       .populate('services.service', 'name price duration')
//       .sort({ bookingDate: -1 });

//     console.log('Bookings found:', bookings.length);
//     console.log('Sample booking:', bookings[0]);

//     res.json({ 
//       success: true,
//       bookings: bookings 
//     });
//   } catch (error) {
//     console.error('Error fetching all bookings:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error', 
//       error: error.message 
//     });
//   }
// });

// module.exports = router;


//-------28112025-------------//
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { auth, barberAuth, adminAuth } = require('../middleware/auth'); // Fixed: import all at once

  
// CREATE BOOKING
  
router.post('/', auth, async (req, res) => {
  try {
    const { barber, services, bookingDate, startTime } = req.body;

    if (!barber) {
      return res.status(400).json({ message: 'Please select a barber' });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Please select at least one service' });
    }

    if (!bookingDate) {
      return res.status(400).json({ message: 'Please provide a booking date' });
    }

    if (!startTime) {
      return res.status(400).json({ message: 'Please provide a booking time' });
    }

    const normalizeTime = (time) => {
      const [rawHour, rawMinute] = time.split(':').map(Number);
      return `${String(rawHour).padStart(2, '0')}:${String(rawMinute).padStart(2, '0')}`;
    };

    const normalizedStartTime = normalizeTime(startTime);

    let totalAmount = 0;
    let totalDuration = 0;
    const serviceDetails = [];

    for (let serviceId of services) {
      const service = await Service.findById(serviceId);
      if (!service) continue;

      const numericDuration = parseInt(service.duration, 10) || 0;
      totalAmount += Number(service.price || 0);
      totalDuration += numericDuration;

      serviceDetails.push({
        service: service._id,
        price: Number(service.price || 0),
        duration: numericDuration,
      });
    }

    if (serviceDetails.length === 0) {
      return res.status(400).json({ message: 'Selected services are invalid' });
    }

    const bookingDateObj = new Date(bookingDate);
    if (Number.isNaN(bookingDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid booking date format' });
    }

    const startOfDay = new Date(bookingDateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    if (startOfDay < todayStart) {
      return res.status(400).json({ message: 'Past date booking not allowed' });
    }

    const [hour, minute] = normalizedStartTime.split(':').map(Number);
    const requestedStart = new Date(startOfDay);
    requestedStart.setHours(hour, minute, 0, 0);

    if (startOfDay.getTime() === todayStart.getTime()) {
      const now = new Date();
      if (requestedStart <= now) {
        return res.status(400).json({ message: 'Cannot book a time slot in the past' });
      }
    }

    const endDate = new Date(requestedStart);
    endDate.setMinutes(endDate.getMinutes() + totalDuration);
    const normalizedEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate
      .getMinutes())
      .padStart(2, '0')}`;

    const existingBookings = await Booking.find({
      barber,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ['cancelled', 'rejected'] },
    }).select('startTime endTime');

    const overlaps = existingBookings.some((booking) => {
      if (!booking.startTime || !booking.endTime) return false;

      return (
        (normalizedStartTime >= booking.startTime && normalizedStartTime < booking.endTime) ||
        (normalizedEndTime > booking.startTime && normalizedEndTime <= booking.endTime) ||
        (normalizedStartTime <= booking.startTime && normalizedEndTime >= booking.endTime)
      );
    });

    if (overlaps) {
      return res.status(400).json({ message: 'Selected slot is already booked' });
    }

    const booking = new Booking({
      customer: req.userId,
      barber,
      services: serviceDetails,
      bookingDate: bookingDateObj,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      totalAmount,
      totalDuration,
    });

    await booking.save();
    await booking.populate('customer barber services.service');

    res.status(201).json(booking);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

  
// GET BOOKINGS
  
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const query =
      req.userRole === 'admin'
        ? {}
        : { $or: [{ customer: req.userId }, { barber: req.userId }] };

    const bookings = await Booking.find(query)
      .populate('customer barber', 'name email phone')
      .populate('services.service', 'name price')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
});

  
// GET BARBER BOOKINGS
  
router.get('/barber-bookings', auth, barberAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ barber: req.userId })
      .populate('customer', 'name email phone')
      .populate('services.service')
      .sort({ bookingDate: 1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching barber bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

  
// GET ALL BOOKINGS (Admin)
  
router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    console.log('=== FETCHING ALL BOOKINGS ===');
    
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('barber', 'name email')
      .populate('services.service', 'name price duration')
      .sort({ bookingDate: -1 });

    console.log(`✅ Found ${bookings.length} bookings`);

    res.json({ 
      success: true,
      bookings: bookings 
    });
  } catch (error) {
    console.error('❌ Error fetching all bookings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

  
// GET AVAILABLE TIME SLOTS
  
router.get('/available-slots/:barberId/:date', async (req, res) => {
  try {
    const { barberId, date } = req.params;
    
    console.log('📅 Fetching available slots for:', { barberId, date });

    const requestedDate = new Date(date);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const startHour = 9;
    const endHour = 18;
    const slotDuration = 30;

    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const isToday = startOfDay.getTime() === today.getTime();

    const existingBookings = await Booking.find({
      barber: barberId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled', 'rejected'] }
    }).select('startTime endTime');

    console.log('📋 Found existing bookings:', existingBookings.length);

    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const slotStartDate = new Date(startOfDay);
        slotStartDate.setHours(hour, minute, 0, 0);
        const isPastSlot = isToday && slotStartDate <= now;

        const isBooked = existingBookings.some(booking => {
          if (!booking.startTime || !booking.endTime) return false;

          const slotStart = timeString;
          const slotEndDate = new Date(slotStartDate);
          slotEndDate.setMinutes(slotEndDate.getMinutes() + slotDuration);
          const slotEnd = `${slotEndDate.getHours().toString().padStart(2, '0')}:${slotEndDate
            .getMinutes()
            .toString()
            .padStart(2, '0')}`;

          return (
            (slotStart >= booking.startTime && slotStart < booking.endTime) ||
            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
            (slotStart <= booking.startTime && slotEnd >= booking.endTime)
          );
        });

        slots.push({
          time: timeString,
          available: !isBooked && !isPastSlot
        });
      }
    }

    console.log('✅ Generated slots:', slots.length, 'Available:', slots.filter(s => s.available).length);
    res.json(slots);
  } catch (error) {
    console.error('❌ Error fetching available slots:', error);
    res.status(500).json({ 
      message: 'Error fetching available slots', 
      error: error.message 
    });
  }
});

  
// UPDATE BOOKING STATUS
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'accepted',
      'confirmed',
      'completed',
      'cancelled',
      'rejected'
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status'
      });
    }

    const booking = await Booking.findById(req.params.id).populate('barber');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userId = req.userId?.toString();
    const barberId = booking.barber?._id?.toString();

    console.log("UserId from token:", userId);
    console.log("UserRole:", req.userRole);
    console.log("Booking Barber ID:", barberId);

    if (req.userRole !== 'admin' && barberId !== userId) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();
    await booking.populate('customer barber services.service');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking',
      error: error.message,
    });
  }
});

  
// TEMPORARY: CREATE TEST DATA
  
router.post('/create-test-data', auth, adminAuth, async (req, res) => {
  try {
    console.log('🔧 Creating test bookings...');

    const customers = await User.find({ role: 'customer' }).limit(2);
    const barbers = await User.find({ role: 'barber' }).limit(2);
    const services = await Service.find().limit(3);

    console.log(`Found ${customers.length} customers, ${barbers.length} barbers, ${services.length} services`);

    if (customers.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No customers found. Please create at least one customer user first.' 
      });
    }

    if (barbers.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No barbers found. Please create at least one barber user first.' 
      });
    }

    if (services.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No services found. Please create some services first.' 
      });
    } 

    const testBookings = [
      {
        customer: customers[0]._id,
        barber: barbers[0]._id,
        services: services.slice(0, 2).map(s => ({
          service: s._id,
          price: s.price,
          duration: s.duration
        })),
        bookingDate: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        totalAmount: services.slice(0, 2).reduce((sum, s) => sum + s.price, 0),
        totalDuration: services.slice(0, 2).reduce((sum, s) => sum + s.duration, 0),
        status: 'completed'
      },
      {
        customer: customers[0]._id,
        barber: barbers[0]._id,
        services: services.slice(0, 1).map(s => ({
          service: s._id,
          price: s.price,
          duration: s.duration
        })),
        bookingDate: new Date(Date.now() - 86400000),
        startTime: '14:00',
        endTime: '15:00',
        totalAmount: services[0].price,
        totalDuration: services[0].duration,
        status: 'completed'
      },
      {
        customer: customers[0]._id,
        barber: barbers[0]._id,
        services: services.slice(0, 2).map(s => ({
          service: s._id,
          price: s.price,
          duration: s.duration
        })),
        bookingDate: new Date(Date.now() + 86400000),
        startTime: '11:00',
        endTime: '12:00',
        totalAmount: services.slice(0, 2).reduce((sum, s) => sum + s.price, 0),
        totalDuration: services.slice(0, 2).reduce((sum, s) => sum + s.duration, 0),
        status: 'pending'
      }
    ];

    const created = await Booking.insertMany(testBookings);
    
    console.log(`✅ Created ${created.length} test bookings`);

    res.json({ 
      success: true,
      message: `Created ${created.length} test bookings`,
      count: created.length,
      bookings: created
    });
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating test data', 
      error: error.message 
    });
  }
});

module.exports = router;
