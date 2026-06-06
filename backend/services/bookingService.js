// const User = require('../models/User');
// const Service = require('../models/Service');
// const Booking = require('../models/Booking');

// const createBooking = async ({
//   serviceName,
//   barberName,
//   time,
//   appointmentDate,
//   userId
// }) => {

//   try {

//     console.log('SERVICE:', serviceName);
//     console.log('TIME:', time);
//     console.log('USER:', userId);

//     // FIND SERVICE
//     const service = await Service.findOne({
//       name: {
//         $regex: serviceName,
//         $options: 'i'
//       }
//     });

//     if (!service) {

//       return {
//         success: false,
//         message: 'Service not found'
//       };

//     }

//     // FIND AVAILABLE BARBER
//     // const barber = await User.findOne({
//     //   role: 'barber',
//     //   available: true
//     // });
//     let barber;

// // IF USER SPECIFIED BARBER
// if (barberName) {

//   barber = await User.findOne({
//     role: 'barber',
//     available: true,
//     name: {
//       $regex: barberName,
//       $options: 'i'
//     }
//   });

//   if (!barber) {
//     return {
//       success: false,
//       message: `Barber ${barberName} not available`
//     };
//   }

// } else {

//   // AUTO ASSIGN ANY BARBER
//   barber = await User.findOne({
//     role: 'barber',
//     available: true
//   });

// }
//     if (!barber) {

//       return {
//         success: false,
//         message: 'No barber available'
//       };

//     }

//     // CHECK SLOT
//     const existingBooking =
//       await Booking.findOne({

//         barber: barber._id,

//         appointmentDate,

//         time,

//         status: {
//           $ne: 'cancelled'
//         }

//       });

//     if (existingBooking) {

//       return {
//         success: false,
//         message: 'Slot already booked'
//       };

//     }

//     // CREATE BOOKING
//     // const booking =
//     //   await Booking.create({

//     //     customer: userId,

//     //     barber: barber._id,

//     //     service: service._id,

//     //     appointmentDate,

//     //     time,

//     //     status: 'pending'

//     //   });
// // CALCULATE END TIME
// // const calculateEndTime = (startTime, duration) => {

// //   const [time, modifier] = startTime.split(' ');

// //   let [hours, minutes] = time.split(':');

// //   hours = parseInt(hours);
// //   minutes = parseInt(minutes);

// //   if (modifier === 'PM' && hours !== 12) {
// //     hours += 12;
// //   }

// //   if (modifier === 'AM' && hours === 12) {
// //     hours = 0;
// //   }

// //   const date = new Date();

// //   date.setHours(hours);
// //   date.setMinutes(minutes);

// //   // ADD DURATION
// //   date.setMinutes(
// //     date.getMinutes() + duration
// //   );

// //   let endHours = date.getHours();
// //   const endMinutes =
// //     date.getMinutes();

// //   let endModifier = 'AM';

// //   if (endHours >= 12) {
// //     endModifier = 'PM';
// //   }

// //   if (endHours > 12) {
// //     endHours -= 12;
// //   }

// //   if (endHours === 0) {
// //     endHours = 12;
// //   }

// //   return `${endHours}:${String(endMinutes).padStart(2, '0')} ${endModifier}`;
// // };
// const calculateEndTime = (
//   startTime,
//   duration
// ) => {

//   // Convert duration to number
//   duration = Number(duration);

//   // Example:
//   // "5:00 PM"

//   const [time, modifier] =
//     startTime.split(' ');

//   let [hours, minutes] =
//     time.split(':').map(Number);

//   // Convert PM
//   if (
//     modifier === 'PM' &&
//     hours !== 12
//   ) {
//     hours += 12;
//   }

//   // Convert 12 AM
//   if (
//     modifier === 'AM' &&
//     hours === 12
//   ) {
//     hours = 0;
//   }

//   // Create date
//   const date = new Date();

//   date.setHours(hours);
//   date.setMinutes(minutes);
//   date.setSeconds(0);

//   // Add duration
//   date.setMinutes(
//     date.getMinutes() + duration
//   );

//   // Final hours/minutes
//   let endHours =
//     date.getHours();

//   let endMinutes =
//     date.getMinutes();

//   const ampm =
//     endHours >= 12
//       ? 'PM'
//       : 'AM';

//   endHours =
//     endHours % 12 || 12;

//   // Format minutes
//   endMinutes =
//     String(endMinutes).padStart(2, '0');

//   return `${endHours}:${endMinutes} ${ampm}`;
// };

// const endTime =
//   calculateEndTime(
//     time,
//     parseInt(service.duration)
//   );

// // CREATE BOOKING
// const booking = await Booking.create({

//     customer: userId,

//     barber: barber._id,

// //    service : [service._id],

//     services: [
//     {
//         service: service._id,
//         price: service.price,
//         duration: parseInt(service.duration)
//     }
//     ],

//     bookingDate: appointmentDate,

//     // appointmentDate,

//     startTime: time,

//      endTime: calculateEndTime(
//       time,
//       parseInt(service.duration)
//     ),

//     // time,

//     totalAmount: service.price,

//     // totalDuration: service.duration,
//     totalDuration: parseInt(service.duration),

//     status: 'pending'

//   });

//     return {

//       success: true,

//       booking,

//       barber,

//       service

//     };

//   } catch (error) {

//     console.log('BOOKING ERROR:', error);

//     return {

//       success: false,

//       message: 'Booking failed'

//     };

//   }

// };

// module.exports = {
//   createBooking
// };

// //-------14062024-----------------
// const User = require('../models/User');
// const Service = require('../models/Service');
// const Booking = require('../models/Booking');

//   
// // PARSE DATE
//   

// const parseDate = (dateString) => {

//   if (!dateString) return null;

//   const parts = dateString.split('-');

//   if (parts.length !== 3) {
//     return null;
//   }

//   const [year, month, day] = parts;

//   return new Date(
//     Number(year),
//     Number(month) - 1,
//     Number(day)
//   );
// };

//   
// // CALCULATE END TIME
//   

// const calculateEndTime = (
//   startTime,
//   duration
// ) => {

//   duration = Number(duration);

//   const [timePart, modifier] =
//     startTime.split(' ');

//   let [hours, minutes] =
//     timePart.split(':').map(Number);

//   // PM
//   if (
//     modifier === 'PM' &&
//     hours !== 12
//   ) {
//     hours += 12;
//   }

//   // 12 AM
//   if (
//     modifier === 'AM' &&
//     hours === 12
//   ) {
//     hours = 0;
//   }

//   const date = new Date();

//   date.setHours(hours);
//   date.setMinutes(minutes);
//   date.setSeconds(0);

//   // Add service duration
//   date.setMinutes(
//     date.getMinutes() + duration
//   );

//   let endHours =
//     date.getHours();

//   let endMinutes =
//     // date.getMinutes();
//      String(date.getMinutes())
//       .padStart(2, '0');
//   const ampm =
//     endHours >= 12
//       ? 'PM'
//       : 'AM';

//   endHours =
//     endHours % 12 || 12;

//   endMinutes =
//     String(endMinutes)
//       .padStart(2, '0');

//   return `${endHours}:${endMinutes} ${ampm}`;
// };

//   
// // GENERATE SLOTS
//   

// const generateSlots = () => {

//   const slots = [];

//   const startHour = 10;
//   const endHour = 20;

//   for (
//     let hour = startHour;
//     hour < endHour;
//     hour++
//   ) {

//     let displayHour =
//       hour > 12
//         ? hour - 12
//         : hour;

//     const ampm =
//       hour >= 12
//         ? 'PM'
//         : 'AM';

//     slots.push(
//       `${displayHour}:00 ${ampm}`
//     );
//   }

//   return slots;
// };

//   
// // GET AVAILABLE SLOTS
//   

// const getAvailableSlots = async ({
//   barberName,
//   appointmentDate
// }) => {

//   try {

//     const bookingDate =
//       parseDate(appointmentDate);

//     if (!bookingDate) {

//       return {
//         success: false,
//         message:
//           'Invalid date format'
//       };
//     }

//     const startOfDay =
//       new Date(bookingDate);

//     startOfDay.setHours(
//       0, 0, 0, 0
//     );

//     const endOfDay =
//       new Date(bookingDate);

//     endOfDay.setHours(
//       23, 59, 59, 999
//     );

//       
//     // FIND BARBERS
//       

//     const barberQuery = {

//       role: 'barber',

//       available: true

//     };

//     if (barberName) {

//       barberQuery.name = {
//         $regex: barberName,
//         $options: 'i'
//       };
//     }

//     const barbers =
//       await User.find(barberQuery);

//     if (!barbers.length) {

//       return {

//         success: false,

//         message:
//           'No barber found'

//       };
//     }

//       
//     // ALL SLOTS
//       

//     const allSlots =
//       generateSlots();

//       
//     // BOOKED SLOTS
//       

//     const bookings =
//       await Booking.find({

//         barber: {
//           $in: barbers.map(
//             b => b._id
//           )
//         },

//         bookingDate: {
//           $gte: startOfDay,
//           $lte: endOfDay
//         },

//         status: {
//           $ne: 'cancelled'
//         }

//       }).select('startTime');

//     const bookedSlots =
//       bookings.map(
//         booking => booking.startTime
//       );

//       
//     // AVAILABLE SLOTS
//       

//     const availableSlots =
//       allSlots.filter(
//         slot =>
//           !bookedSlots.includes(slot)
//       );

//     return {

//       success: true,

//       availableSlots

//     };

//   } catch (error) {

//     console.log(
//       ' SLOT ERROR:',
//       error
//     );

//     return {

//       success: false,

//       message:
//         'Failed to fetch slots'

//     };
//   }
// };

//   
// // CREATE BOOKING
//   

// const createBooking = async ({
//   serviceName,
//   barberName,
//   time,
//   appointmentDate,
//   userId
// }) => {

//   try {

//     console.log('SERVICE:', serviceName);
//     console.log('BARBER:', barberName);
//     console.log('TIME:', time);
//     console.log('DATE:', appointmentDate);
//     console.log('USER:', userId);

//       
//     // VALIDATION
//       

//     if (!serviceName) {

//       return {
//         success: false,
//         message:
//           'Please provide service name'
//       };
//     }

//     if (!appointmentDate) {

//       return {
//         success: false,
//         message:
//           'Please provide booking date'
//       };
//     }

//     if (!time) {

//       return {
//         success: false,
//         message:
//           'Please provide booking time'
//       };
//     }

//       
//     // FIND SERVICE
//       

//     const service =
//       await Service.findOne({

//         name: {
//           $regex: serviceName,
//           $options: 'i'
//         }

//       });

//     if (!service) {

//       return {

//         success: false,

//         message:
//           'Service not found'

//       };
//     }

//       
//     // DATE
//       

//     const bookingDate =
//       parseDate(appointmentDate);

//     if (!bookingDate) {

//       return {

//         success: false,

//         message:
//           'Invalid date format. Use YYYY-MM-DD'

//       };
//     }

//     const startOfDay =
//       new Date(bookingDate);

//     startOfDay.setHours(
//       0, 0, 0, 0
//     );

//     const endOfDay =
//       new Date(bookingDate);

//     endOfDay.setHours(
//       23, 59, 59, 999
//     );

//       
//     // PREVENT PAST DATE
//       

//     const today = new Date();

//     today.setHours(
//       0, 0, 0, 0
//     );

//     if (startOfDay < today) {

//       return {

//         success: false,

//         message:
//           'Past date booking not allowed'

//       };
//     }

//       
//     // FIND BARBER
//       

//     let barber = null;

//     // USER CHOOSES BARBER

// //     if (barberName) {

// //       // barber =
// //       //   await User.findOne({

// //       //     role: 'barber',

// //       //     available: true,

// //       //     name: {
// //       //       $regex: barberName,
// //       //       $options: 'i'
// //       //     }

// //       //   });

// //       let barber;

// //       // USER SELECTED BARBER
// //       if (barberName) {

// //         barber =
// //           await User.findOne({

// //             role: 'barber',

// //             available: true,

// //             name: {
// //               $regex:
// //                 new RegExp(
// //                   '^' + barberName + '$',
// //                   'i'
// //                 )
// //             }

// //           });

// //       } else {

// //         // AUTO ASSIGN
// //         barber =
// //           await User.findOne({

// //             role: 'barber',
// //             available: true

// //           });

// //       }

// //       // CHECK BARBER SERVICE

// // const barberServices =
// //   barber.services || [];

// // // SERVICE ID MATCH
// // const serviceAllowed =
// //   barberServices.some((id) => {

// //     return (
// //       id.toString() ===
// //       service._id.toString()
// //     );

// //   });

// // if (!serviceAllowed) {

// //   return {

// //     success: false,

// //     message:
// //       `
// // Barber ${barber.name}
// // does not provide
// // ${service.name} service.
// // `

// //   };

// // }

// //       if (!barber) {

// //         return {

// //           success: false,

// //           message:
// //             `Barber ${barberName} not available`

// //         };
// //       }

// //       // SLOT CHECK

// //       const existingBooking =
// //         await Booking.findOne({

// //           barber: barber._id,

// //           bookingDate: {
// //             $gte: startOfDay,
// //             $lte: endOfDay
// //           },

// //           startTime: time,

// //           status: {
// //             $ne: 'cancelled'
// //           }

// //         });

// //       if (existingBooking) {

// //         const slotResult =
// //           await getAvailableSlots({

// //             barberName,

// //             appointmentDate

// //           });

// //         return {

// //           success: false,

// //           message:
// //             `This slot is unavailable for Barber ${barber.name}`,

// //           availableSlots:
// //             slotResult.availableSlots || []

// //         };
// //       }

// //     } else {

// //         
// //       // AUTO ASSIGN BARBER
// //         

// //       const barbers =
// //         await User.find({

// //           role: 'barber',

// //           available: true

// //         });

// //       for (const b of barbers) {

// //         const existingBooking =
// //           await Booking.findOne({

// //             barber: b._id,

// //             bookingDate: {
// //               $gte: startOfDay,
// //               $lte: endOfDay
// //             },

// //             startTime: time,

// //             status: {
// //               $ne: 'cancelled'
// //             }

// //           });

// //         // FREE SLOT

// //         if (!existingBooking) {

// //           barber = b;

// //           break;
// //         }
// //       }

// //       if (!barber) {

// //         return {

// //           success: false,

// //           message:
// //             'No barber available at this time'

// //         };
// //       }
// //     }

//       =
//     // FIND BARBER
//       =

   
//     // USER SELECTED BARBER

//     if (barberName) {

//       barber =
//         await User.findOne({

//           role: 'barber',

//           available: true,

//           name: {
//             $regex: barberName,
//             $options: 'i'
//           }

//         });

//       if (!barber) {

//         return {

//           success: false,

//           message:
//             `Barber ${barberName} not found`

//         };

//       }

//     }

//     // AUTO ASSIGN BARBER

//     else {

//       barber =
//         await User.findOne({

//           role: 'barber',

//           available: true

//         });

//       if (!barber) {

//         return {

//           success: false,

//           message:
//             'No barber available'

//         };

//       }

//     }

//       
//     // END TIME
//       

//     const endTime =
//       calculateEndTime(
//         time,
//         parseInt(service.duration)
//       );
 
//       
//     // CREATE BOOKING
//       

//     const booking =
//       await Booking.create({

//         customer: userId,

//         barber: barber._id,

//         services: [
//           {
//             service: service._id,
//             price: service.price,
//             duration:
//               parseInt(service.duration)
//           }
//         ],

//         bookingDate,

//         startTime: time,

//         endTime,

//         totalAmount:
//           service.price,

//         totalDuration:
//           parseInt(service.duration),

//         status: 'pending'

//       });

//     return {

//       success: true,

//       message:
//         'Appointment booked successfully',

//       booking,

//       barber,

//       service

//     };

//   } catch (error) {

//     console.log(
//       'BOOKING ERROR:',
//       error
//     );

//     return {

//       success: false,

//       message:
//         'Booking failed'

//     };
//   }
// };

// module.exports = {
//   createBooking,
//   getAvailableSlots
// };

const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

  
// PARSE DATE
  

const parseDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

  
// CALCULATE END TIME
  

const calculateEndTime = (startTime, duration) => {
  duration = Number(duration);
  const [timePart, modifier] = startTime.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMinutes(date.getMinutes() + duration);

  let endHours = date.getHours();
  const ampm = endHours >= 12 ? 'PM' : 'AM';
  endHours = endHours % 12 || 12;
  const endMinutes = String(date.getMinutes()).padStart(2, '0');

  return `${endHours}:${endMinutes} ${ampm}`;
};

  
// GENERATE SLOTS
  

const generateSlots = () => {
  const slots = [];
  const startHour = 10;
  const endHour = 20;

  for (let hour = startHour; hour < endHour; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${displayHour}:00 ${ampm}`);
  }

  return slots;
};

  
// GET AVAILABLE SLOTS
  

const getAvailableSlots = async ({ barberName, appointmentDate }) => {
  try {
    const bookingDate = parseDate(appointmentDate);

    if (!bookingDate) {
      return { success: false, message: 'Invalid date format' };
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

      
    // FIND BARBER(S)
      

    const barberQuery = { role: 'barber', available: true };

    if (barberName) {
      barberQuery.name = { $regex: barberName, $options: 'i' };
    }

    const barbers = await User.find(barberQuery);

    if (!barbers.length) {
      return { success: false, message: 'No barber found' };
    }

    const allSlots = generateSlots();

      
    // KEY FIX:
    // If a specific barber is requested, check ONLY that barber's bookings.
    // If no barber specified, a slot is available if ANY barber is free at that time.
      

    if (barberName) {
      // Single barber selected — show slots free for THIS barber only
      const barber = barbers[0];

      const bookings = await Booking.find({
        barber: barber._id,          // ← scope to this barber only
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      }).select('startTime');

      const bookedSlots = bookings.map((b) => b.startTime);

      const availableSlots = allSlots.filter(
        (slot) => !bookedSlots.includes(slot)
      );

      return { success: true, availableSlots, barber };

    } else {
      // No barber specified — a slot is available if at least one barber is free
      const barberIds = barbers.map((b) => b._id);

      const bookings = await Booking.find({
        barber: { $in: barberIds },
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' }
      }).select('startTime barber');

      // Build a map: slot → set of barber IDs who are booked at that slot
      const bookedBarbersPerSlot = {};
      for (const booking of bookings) {
        const slot = booking.startTime;
        if (!bookedBarbersPerSlot[slot]) bookedBarbersPerSlot[slot] = new Set();
        bookedBarbersPerSlot[slot].add(booking.barber.toString());
      }

      // Slot is available if at least one barber is NOT booked at that time
      const availableSlots = allSlots.filter((slot) => {
        const bookedCount = bookedBarbersPerSlot[slot]?.size || 0;
        return bookedCount < barbers.length; // at least one barber free
      });

      return { success: true, availableSlots };
    }

  } catch (error) {
    console.log('SLOT ERROR:', error);
    return { success: false, message: 'Failed to fetch slots' };
  }
};

  
// CREATE BOOKING
  

const createBooking = async ({
  serviceName,
  barberName,
  time,
  appointmentDate,
  userId
}) => {
  try {
    console.log('SERVICE:', serviceName);
    console.log('BARBER:', barberName);
    console.log('TIME:', time);
    console.log('DATE:', appointmentDate);
    console.log('USER:', userId);

      
    // VALIDATION
      

    if (!serviceName) {
      return { success: false, message: 'Please provide service name' };
    }

    if (!appointmentDate) {
      return { success: false, message: 'Please provide booking date' };
    }

    if (!time) {
      return { success: false, message: 'Please provide booking time' };
    }

      
    // FIND SERVICE
      

    const service = await Service.findOne({
      name: { $regex: serviceName, $options: 'i' }
    });

    if (!service) {
      return { success: false, message: 'Service not found' };
    }

      
    // DATE

    const bookingDate = parseDate(appointmentDate);

    if (!bookingDate) {
      return { success: false, message: 'Invalid date format. Use YYYY-MM-DD' };
    }

    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

      
    // PREVENT PAST DATE
      

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startOfDay < today) {
      return { success: false, message: 'Past date booking not allowed' };
    }

      
    // FIND BARBER + SLOT CONFLICT CHECK
      

    let barber = null;

    if (barberName) {
      // USER SELECTED A SPECIFIC BARBER

      barber = await User.findOne({
        role: 'barber',
        available: true,
        name: { $regex: barberName, $options: 'i' }
      });

      if (!barber) {
        return { success: false, message: `Barber ${barberName} not found` };
      }

      // Check conflict for THIS barber only
      const conflict = await Booking.findOne({
        barber: barber._id,           // ← scope to this barber only
        bookingDate: { $gte: startOfDay, $lte: endOfDay },
        startTime: time,
        status: { $ne: 'cancelled' }
      });

      if (conflict) {
        const slotResult = await getAvailableSlots({ barberName, appointmentDate });
        return {
          success: false,
          message: `${time} is already booked for ${barber.name}. Please pick another slot.`,
          availableSlots: slotResult.availableSlots || []
        };
      }

    } else {
      // AUTO ASSIGN — find first barber free at requested time

      const allBarbers = await User.find({ role: 'barber', available: true });

      for (const b of allBarbers) {
        const conflict = await Booking.findOne({
          barber: b._id,
          bookingDate: { $gte: startOfDay, $lte: endOfDay },
          startTime: time,
          status: { $ne: 'cancelled' }
        });

        if (!conflict) {
          barber = b;
          break;
        }
      }

      if (!barber) {
        return { success: false, message: 'No barber available at this time' };
      }
    }

      
    // END TIME
      

    const endTime = calculateEndTime(time, parseInt(service.duration));

      
    // CREATE BOOKING
      

    const booking = await Booking.create({
      customer: userId,
      barber: barber._id,
      services: [
        {
          service: service._id,
          price: service.price,
          duration: parseInt(service.duration)
        }
      ],
      bookingDate,
      startTime: time,
      endTime,
      totalAmount: service.price,
      totalDuration: parseInt(service.duration),
      status: 'pending'
    });

    return {
      success: true,
      message: 'Appointment booked successfully',
      booking,
      barber,
      service
    };

  } catch (error) {
    console.log('BOOKING ERROR:', error);
    return { success: false, message: 'Booking failed' };
  }
};

module.exports = { createBooking, getAvailableSlots };
