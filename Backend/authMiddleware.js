/**
 * Authentication Middleware
 * Protects routes and checks user permissions
 */

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

/**
 * Check if user is an admin (regular or super)
 */
export const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId) {
    if (req.session.userType === 'admin' || req.session.userType === 'superadmin') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

/**
 * Check if user is a super admin
 */
export const isSuperAdmin = (req, res, next) => {
  if (req.session && req.session.userId) {
    if (req.session.userType === 'superadmin') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

/**
 * Check if user is a customer/member
 */
export const isCustomer = (req, res, next) => {
  if (req.session && req.session.userId) {
    if (req.session.userType === 'customer') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Customer access only'
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};






