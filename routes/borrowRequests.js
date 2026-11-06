const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const BorrowRequest = require('../models/BorrowRequest');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const FINE_PER_DAY = 0.25;
const configuredLoanDays = Number(process.env.LOAN_PERIOD_DAYS);
const LOAN_DAYS = Number.isInteger(configuredLoanDays) && configuredLoanDays >= 0 && configuredLoanDays <= 365
  ? configuredLoanDays
  : 14;
const allowedStatuses = new Set(['pending', 'approved', 'returned', 'late']);

function badRequest(res, field, message) {
  return res.status(400).json({ error: 'Validation failed.', fields: [{ field, message }] });
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = req.user.role === 'librarian' && req.query.mine !== 'true'
      ? {}
      : { user: req.user._id };
    const requests = await BorrowRequest.find(filter)
      .populate('book', 'title author isbn coverImage')
      .populate('user', 'username email')
      .sort({ requestedAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  let reservedBookId;
  try {
    const bookId = req.body?.bookId;
    if (typeof bookId !== 'string' || !mongoose.isValidObjectId(bookId)) {
      return badRequest(res, 'bookId', 'Must be a valid book id.');
    }

    const book = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true },
    );
    if (!book) {
      const existing = await Book.exists({ _id: bookId });
      if (!existing) return res.status(404).json({ error: 'Book not found.' });
      return res.status(409).json({ error: 'No copies of this book are currently available.' });
    }
    reservedBookId = book._id;

    const requestedAt = new Date();
    const dueAt = new Date(requestedAt.getTime() + LOAN_DAYS * 24 * 60 * 60 * 1000);
    const request = await BorrowRequest.create({
      book: book._id,
      user: req.user._id,
      requestedAt,
      dueAt,
    });
    reservedBookId = null;

    return res.status(201).json(await request.populate([
      { path: 'book', select: 'title author isbn coverImage' },
      { path: 'user', select: 'username email' },
    ]));
  } catch (error) {
    if (reservedBookId) {
      try {
        await Book.updateOne({ _id: reservedBookId }, { $inc: { availableCopies: 1 } });
      } catch (rollbackError) {
        console.error('Could not restore a reserved book copy:', rollbackError.message);
      }
    }
    return next(error);
  }
});

router.patch('/:id', requireAuth, requireRole('librarian'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return badRequest(res, 'id', 'Must be a valid request id.');
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)
      || Object.keys(req.body).length !== 1 || typeof req.body.status !== 'string') {
      return badRequest(res, 'status', 'Provide only a valid status field.');
    }
    if (!allowedStatuses.has(req.body.status)) {
      return badRequest(res, 'status', 'Must be pending, approved, returned, or late.');
    }

    const request = await BorrowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Borrow request not found.' });

    const previousStatus = request.status;
    if (previousStatus === 'returned' && req.body.status !== 'returned') {
      return res.status(409).json({ error: 'A returned borrow request cannot be reopened.' });
    }
    if (previousStatus === 'returned') {
      return res.status(200).json(await request.populate([
        { path: 'book', select: 'title author isbn coverImage' },
        { path: 'user', select: 'username email' },
      ]));
    }
    request.status = req.body.status;
    if (req.body.status === 'returned') {
      const returnedAt = new Date();
      const lateMilliseconds = returnedAt.getTime() - request.dueAt.getTime();
      const lateDays = lateMilliseconds > 0 ? Math.ceil(lateMilliseconds / (24 * 60 * 60 * 1000)) : 0;
      request.returnedAt = returnedAt;
      request.fine = Math.round(lateDays * FINE_PER_DAY * 100) / 100;
    } else {
      request.returnedAt = null;
      request.fine = 0;
    }

    await request.save();
    if (req.body.status === 'returned' && previousStatus !== 'returned') {
      await Book.updateOne({ _id: request.book }, { $inc: { availableCopies: 1 } });
    }

    return res.status(200).json(await request.populate([
      { path: 'book', select: 'title author isbn coverImage' },
      { path: 'user', select: 'username email' },
    ]));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
