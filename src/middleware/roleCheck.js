const { ROLES } = require('../models/User');

/**
 * Middleware to check if user has required role(s)
 * Usage: requireRole('admin') or requireRole(['admin', 'planner'])
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;

    // Flatten array if roles passed as array
    const roles = allowedRoles.flat();

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

/**
 * Shorthand middlewares for common role checks
 */
const requireAdmin = requireRole(ROLES.ADMIN);

const requirePlanner = requireRole(ROLES.PLANNER);

const requireVendor = requireRole(ROLES.VENDOR);

const requirePlannerOrAdmin = requireRole(ROLES.PLANNER, ROLES.ADMIN);

const requireVendorOrPlanner = requireRole(ROLES.VENDOR, ROLES.PLANNER);

/**
 * Check if user is accessing their own resource
 * Admins can access any resource
 */
const requireOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const requestedUserId = req.params[userIdParam] || req.body[userIdParam];
    const currentUserId = req.user.id;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (currentUserId === requestedUserId || isAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requirePlanner,
  requireVendor,
  requirePlannerOrAdmin,
  requireVendorOrPlanner,
  requireOwnerOrAdmin,
  ROLES
};