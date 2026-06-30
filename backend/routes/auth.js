const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth, barberAuth } = require('../middleware/auth');// ✅ make sure this exists and is exported correctly

// Generate JWT Token -  UPDATED to include role
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId: userId, 
      id: userId,  // Include both for compatibility
      role: role   //  Include role in token
    }, 
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// REGISTER user (customer, barber, admin)
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").matches(/^\d{10}$/).withMessage("Please enter a valid 10-digit phone number"),
    body("role").isIn(["customer", "barber", "admin"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { name, email, password, phone, role, specialty, experience, bio } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ success: false, message: "User with this email already exists" });

      const userData = { name, email, password, phone, role };
      if (role === "barber") {
        if (!specialty || !experience) {
          return res.status(400).json({ success: false, message: "Specialty and experience are required for barbers" });
        }
        userData.specialty = specialty;
        userData.experience = experience;
        if (bio) userData.bio = bio;
      }

      const user = await User.create(userData);
      const token = generateToken(user._id, user.role);  // Pass role

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ success: false, message: "Error registering user", error: error.message });
    }
  }
);

// LOGIN user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Your account has been deactivated. Please contact support." });
      }

      const token = generateToken(user._id, user.role);  // ✅ Pass role
      
      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          ...(user.role === "barber" && {
            specialty: user.specialty,
            experience: user.experience,
            rating: user.rating,
            reviews: user.reviews,
            available: user.available,
          }),
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Error logging in", error: error.message });
    }
  }
);

// REFRESH token endpoint - generate new token from expired token
router.post("/refresh", async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token' });
    }

    // Verify token ignoring expiration to extract user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', { ignoreExpiration: true });
    
    if (!decoded.id && !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token structure' });
    }

    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    // Generate new token
    const newToken = generateToken(user._id, user.role);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({ success: false, message: 'Failed to refresh token', error: error.message });
  }
});

// GET current logged in user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ success: false, message: "Error fetching user data", error: error.message });
  }
});

// UPDATE profile for current user
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name, phone, specialty, experience, bio } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (req.userRole === "barber") {
      if (specialty) updateData.specialty = specialty;
      if (experience) updateData.experience = experience;
      if (bio !== undefined) updateData.bio = bio;
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
});

// CHANGE password for current user
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.userId).select("+password");

      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }

      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ success: false, message: "Error changing password", error: error.message });
    }
  }
);

module.exports = router;