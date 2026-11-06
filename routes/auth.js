const express = require('express');
const User = require('../models/User');
const { COOKIE_NAME, cookieOptions, signToken } = require('../middleware/auth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validationError(res, field, message) {
  return res.status(400).json({ error: 'Validation failed.', fields: [{ field, message }] });
}

router.post('/register', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return validationError(res, 'body', 'Must be a JSON object.');
    }
    const allowed = new Set(['username', 'email', 'password']);
    const unknownField = Object.keys(req.body).find((field) => !allowed.has(field));
    if (unknownField) return validationError(res, unknownField, 'Unknown field.');

    const { username, email, password } = req.body;
    if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 40) {
      return validationError(res, 'username', 'Must be a string from 3 to 40 characters.');
    }
    if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
      return validationError(res, 'email', 'Must be a valid email address.');
    }
    if (typeof password !== 'string' || password.length < 8) {
      return validationError(res, 'password', 'Must be a string of at least 8 characters.');
    }

    const user = await User.create({ username: username.trim(), email: email.trim(), password });
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return validationError(res, 'body', 'Must be a JSON object.');
    }
    const { email, password } = req.body;
    if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
      return validationError(res, 'email', 'Must be a valid email address.');
    }
    if (typeof password !== 'string' || password.length === 0) {
      return validationError(res, 'password', 'Must be a non-empty string.');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
    return res.status(200).json({ message: 'Login successful.', user });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return res.status(200).json({ message: 'Logged out.' });
});

module.exports = router;
