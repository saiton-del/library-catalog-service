const express = require('express');
const Booking = require('../models/Booking');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const spaces = new Set(['The Reading Room', 'Quiet Study Nook', 'Community Table', 'Garden Terrace']);
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function badRequest(res, field, message) {
  return res.status(400).json({ error: 'Validation failed.', fields: [{ field, message }] });
}

router.get('/', requireAuth, requireRole('librarian'), async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'username email')
      .sort({ date: 1, startTime: 1 });
    return res.status(200).json(bookings);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { space, date, startTime, endTime } = req.body || {};
    if (typeof space !== 'string' || !spaces.has(space)) {
      return badRequest(res, 'space', 'Choose a valid library space.');
    }
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return badRequest(res, 'date', 'Must be a valid date in YYYY-MM-DD format.');
    }
    const dateValue = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(dateValue.getTime()) || dateValue.toISOString().slice(0, 10) !== date) {
      return badRequest(res, 'date', 'Must be a real calendar date.');
    }
    if (typeof startTime !== 'string' || !timePattern.test(startTime)) {
      return badRequest(res, 'startTime', 'Must be a time in 24-hour HH:mm format.');
    }
    if (typeof endTime !== 'string' || !timePattern.test(endTime)) {
      return badRequest(res, 'endTime', 'Must be a time in 24-hour HH:mm format.');
    }
    if (startTime >= endTime) {
      return badRequest(res, 'endTime', 'Must be later than startTime.');
    }

    // Half-open intervals overlap when existing.start < new.end and existing.end > new.start.
    const conflict = await Booking.findOne({
      space,
      date: dateValue,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });
    if (conflict) {
      return res.status(409).json({
        error: 'This space is already booked for part or all of that time range.',
        conflictId: conflict._id,
      });
    }

    const booking = await Booking.create({
      space,
      date: dateValue,
      startTime,
      endTime,
      user: req.user._id,
    });
    return res.status(201).json(await booking.populate('user', 'username email'));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
