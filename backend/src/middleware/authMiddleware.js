const jwt = require('jsonwebtoken');

// Verify JWT token
exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log('🔐 Authenticate middleware - Token present:', !!token);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Check role authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Flatten array in case roles is passed as array
    const allowedRoles = roles.flat();
    
    console.log('🔒 Authorize middleware - Required roles:', allowedRoles);
    console.log('👤 User role from token:', req.user?.role);
    console.log('👤 User object:', req.user);
    console.log('✓ Role check:', allowedRoles.includes(req.user?.role));
    
    if (!req.user || !req.user.role) {
      console.log('❌ No user or role in request');
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log('❌ ACCESS DENIED - User role "' + req.user.role + '" not in allowed roles:', allowedRoles);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    console.log('✅ Access granted!');
    next();
  };
};
