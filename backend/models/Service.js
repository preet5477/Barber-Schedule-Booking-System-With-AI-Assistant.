const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['haircut', 'beard', 'shave', 'coloring', 'facial', 'styling']
  },
  icon: {
    type: String,
    default: '💇'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);