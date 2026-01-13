const jwt = require('jsonwebtoken');

// 1. Verify the User is Logged In
const protect = (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Remove 'Bearer '
      
      // Verify token
      // CHANGE: Use process.env.JWT_SECRET instead of hardcoded string
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
      
      // Add user to request object
      req.user = decoded; 
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Check if User is Admin (Legacy/Simple)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// 3. Generic Role Authorization (Flexible RBAC)
// Usage: authorize('admin', 'distributor')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: `User role '${req.user.userType}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, adminOnly, authorize };