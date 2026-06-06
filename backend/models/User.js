const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['customer', 'barber', 'admin'],
    default: 'customer'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  //  Used by frontend for showing online/available barbers
  available: {
    type: Boolean,
    default: true
  },

  // ------- BARBER FIELDS (FIXED TO MATCH FRONTEND) -------
  
  specialty: {                 //  now matches frontend input name
    type: String,
    default: ""
  },

  bio: {                       //  added to match frontend form
    type: String,
    default: ""
  },

  experience: {               //  changed to String because frontend sends "5 years"
    type: String,
    default: ""
  },

  rating: {
    type: Number,
    default: 0
  },

  profileImage: {
    type: String,
    default: ""
  },

  workingHours: {
    start: { type: String, default: "" },
    end: { type: String, default: "" }
  },

  holidays: [
    {
      date: Date,
      reason: String
    }
  ],

  breaks: [
    {
      day: String,
      startTime: String,
      endTime: String
    }
  ]

}, { timestamps: true });
 

// ----------------- PASSWORD HASHING -----------------
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ----------------- PASSWORD COMPARE ------------------
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
