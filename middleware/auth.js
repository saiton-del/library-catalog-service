const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'library_token';
const TOKEN_TTL_SECONDS = 60 * 60;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS * 1000,
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random secret of at least 32 characters.');
  }
  return jwt.sign({ sub: user._id.toString() }, secret, { expiresIn: TOKEN_TTL_SECONDS });
}

async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    if (!claims.sub) return res.status(401).json({ error: 'Invalid or expired authentication token.' });

    const user = await User.findById(claims.sub).select('username email role createdAt updatedAt');
    if (!user) return res.status(401).json({ error: 'Invalid or expired authentication token.' });

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    return next(error);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient role.' });
    return next();
  };
}

module.exports = { COOKIE_NAME, cookieOptions, requireAuth, requireRole, signToken };
