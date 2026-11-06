const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');
const bookingsRouter = require('./routes/bookings');
const borrowRequestsRouter = require('./routes/borrowRequests');
const genresRouter = require('./routes/genres');
const usersRouter = require('./routes/users');

const app = express();
const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : [...new Set([...configuredOrigins, 'http://localhost:5173', 'http://localhost:4173'])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use((req, res, next) => {
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const origin = req.get('Origin');
  if (process.env.NODE_ENV === 'production' && isStateChanging && origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Request origin is not allowed.' });
  }
  return next();
});
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/borrow-requests', borrowRequestsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/books', booksRouter);
app.use('/genres', genresRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  if (error.name === 'ValidationError') {
    const fields = Object.entries(error.errors).map(([field, detail]) => ({
      field,
      message: detail.message,
    }));
    return res.status(400).json({ error: 'Validation failed.', fields });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid value.',
      fields: [{ field: error.path || 'id', message: `Invalid ${error.path || 'id'} value.` }],
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'value';
    return res.status(400).json({
      error: 'A record with this value already exists.',
      fields: [{ field, message: `${field} must be unique.` }],
    });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;