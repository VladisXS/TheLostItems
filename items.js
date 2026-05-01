const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.warn('⚠️  No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified for user:', decoded.email);
    if (!decoded?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('❌ Invalid token:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateAdmin };
