const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  // console.log('Auth middleware - authHeader:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  // console.log('Auth middleware - token:', token ? 'present' : 'missing');
  if (!token) {
    // console.log('Auth middleware - no token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Auth middleware - decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    // console.log('Auth middleware - token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 