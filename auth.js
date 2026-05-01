const jwt = require('jsonwebtoken');

// Admin login
const adminLogin = (req, res) => {
  return res.status(403).json({ error: 'Password login disabled. Use Google sign-in only.' });
};

// Google OAuth callback
const googleCallback = (req, res) => {
  try {
    const user = req.user;
    const allowedAdminEmail = (process.env.ADMIN_EMAIL || 'vladislavvitiv@gmail.com').toLowerCase();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const nextPathFromSession = req.session?.oauthNext;
    const nextPath = typeof nextPathFromSession === 'string' && nextPathFromSession.startsWith('/') && !nextPathFromSession.startsWith('//')
      ? nextPathFromSession
      : '/admin.html';

    if (!user?.email) {
      if (req.session) delete req.session.oauthNext;
      return res.redirect(`${frontendUrl}/index.html?error=auth_failed`);
    }

    const isAdmin = user.email.toLowerCase() === allowedAdminEmail;
    const isTryingAdmin = nextPath.startsWith('/admin.html');
    
    // Create JWT token for authenticated user
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // If user is not admin but attempted to open admin panel, send them to home with neutral reason.
    if (req.session) delete req.session.oauthNext;
    if (!isAdmin && isTryingAdmin) {
      return res.redirect(`${frontendUrl}/index.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo
      }))}&notice=no_admin_access`);
    }

    // Redirect to requested frontend page with token
    const separator = nextPath.includes('?') ? '&' : '?';
    res.redirect(`${frontendUrl}${nextPath}${separator}token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo
    }))}`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Verify token
const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  adminLogin,
  googleCallback,
  verifyToken,
};


