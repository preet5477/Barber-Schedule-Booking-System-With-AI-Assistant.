const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// =======================================
// GET ALL BARBERS (Public)
// =======================================
router.get('/barbers', async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber', isActive: true })
      .select('-password');
    res.json({ success: true, barbers }); // ✅ wrapped properly
  } catch (error) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// =======================================
// ADD NEW BARBER (Admin Only)
// =======================================
router.post('/barbers', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, specialty, experience, bio, available } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Barber with this email already exists' });
    }

    // Create new barber
    const barber = await User.create({
      name,
      email,
      phone,
      specialty,
      experience,
      bio,
      available,
      role: 'barber',
      isActive: true,
      password: 'default123', // ✅ Optional: Temporary password (change on login)
    });

    res.status(201).json({
      success: true,
      message: 'Barber added successfully!',
      barber,
    });
  } catch (error) {
    console.error('Error adding barber:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// =======================================
// GET ALL USERS (Admin Only)
// =======================================
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================================
// UPDATE BARBER PROFILE
// =======================================
router.put('/barber/:id', auth, async (req, res) => {
  try {
    const { workingHours, holidays, breaks, specialization, experience } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { workingHours, holidays, breaks, specialization, experience },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating barber:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =======================================
// TOGGLE USER ACTIVE STATUS (Admin Only)
// =======================================
router.patch('/:id/toggle-active', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
