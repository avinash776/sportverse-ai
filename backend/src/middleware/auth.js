// ==================================================
// SportVerse AI - JWT Authentication Middleware
// ==================================================
// Verifies JWT tokens and attaches user data to requests.
// Also provides role-based access control.
// ==================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches decoded user to req.user
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Middleware to check if user has required role
 * @param  {...string} roles - Allowed roles (e.g., 'coach', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    next();
  };
}

/**
 * Middleware to check if coach is verified
 */
function requireVerifiedCoach(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'coach' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Coach access required.' });
  }
  if (!req.user.coach_verified && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Coach verification pending.' });
  }
  next();
}

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id || user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { authenticateToken, requireRole, requireVerifiedCoach, generateToken };
