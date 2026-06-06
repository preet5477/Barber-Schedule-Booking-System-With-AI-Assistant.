const Booking = require('../models/Booking');

const cancelBooking = async (
  userId
) => {

  const booking =
    await Booking.findOne({

      customer: userId,
      status: 'pending'

    });

  if (!booking) {

    return {
      success: false,
      message: 'No booking found'
    };

  }

  booking.status = 'cancelled';

  await booking.save();

  return {
    success: true
  };
};

module.exports = {
  cancelBooking
};