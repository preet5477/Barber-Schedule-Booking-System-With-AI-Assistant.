const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   barber: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   services: [{
//     service: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true
//     },
//     price: Number,
//     duration: Number
//   }],
//   bookingDate: {
//     type: Date,
//     required: true
//   },
//   startTime: {
//     type: String,
//     required: true
//   },
//   endTime: {
//     type: String,
//     required: true
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   totalDuration: {
//     type: Number,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   notes: String,
//   rejectionReason: String
// }, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    price: Number,
    duration: Number
  }],
  bookingDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  totalDuration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'confirmed',
      'completed',
      'cancelled',
      'rejected'
    ],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
