module.exports = function (req, res, next) {
  console.log('Admin middleware - req.user:', req.user);
  if (!req.user || req.user.type !== 'admin') {
    console.log('Admin middleware - Access denied. User type:', req.user?.type);
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  console.log('Admin middleware - Access granted');
  next();
};
