const jwt = require('jsonwebtoken');

// General Authentication Middleware
const auth = (req, res, next) => { 
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    //  Compatible with all old tokens (id or userId)
    req.userId = decoded.id || decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ================================
// Admin Authorization
// ================================
const adminAuth = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ================================
// Barber Authorization
// ================================
const barberAuth = (req, res, next) => {
  if (req.userRole !== 'barber' && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Barber access required' });
  }
  next();
};

module.exports = { auth, adminAuth, barberAuth };
