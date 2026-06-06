const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/services
// @desc    Get all active services (Public - all users can see)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
});

// @route   GET /api/services/admin/all
// @desc    Get all services, including inactive services
// @access  Private/Admin
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Error fetching admin services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
});

// @route   POST /api/services
// @desc    Create new service (Admin only)
// @access  Private/Admin
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, price, duration, category, icon } = req.body;

    // Validate required fields
    if (!name || !description || !price || !duration || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if service already exists
    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this name already exists'
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      duration,
      category,
      icon: icon || '💇'
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service (Admin only)
// @access  Private/Admin
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, price, duration, category, icon, isActive } = req.body;

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update fields
    if (name) service.name = name;
    if (description) service.description = description;
    if (price) service.price = price;
    if (duration) service.duration = duration;
    if (category) service.category = category;
    if (icon) service.icon = icon;
    if (typeof isActive !== 'undefined') service.isActive = isActive;

    await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
});

// @route   PATCH /api/services/:id/status
// @desc    Activate/deactivate service (Admin only)
// @access  Private/Admin
router.patch('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false'
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    service.isActive = isActive;
    await service.save();

    res.json({
      success: true,
      message: isActive
        ? 'Service activated successfully'
        : 'Service deactivated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service status',
      error: error.message
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Soft delete - just mark as inactive
    service.isActive = false;
    await service.save();

    // Or hard delete - completely remove from DB
    // await service.deleteOne();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
});

module.exports = router;
