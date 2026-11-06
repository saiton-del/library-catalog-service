const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const { validate, validateObjectId } = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function positiveInteger(value, fallback, field, res, maximum = Number.MAX_SAFE_INTEGER) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > maximum) {
    res.status(400).json({
      error: 'Validation failed.',
      fields: [{ field, message: `Must be an integer from 1 to ${maximum}.` }],
    });
    return null;
  }
  return Number(value);
}

router.get('/', async (req, res, next) => {
  try {
    const page = positiveInteger(req.query.page, 1, 'page', res);
    if (page === null) return;
    const limit = positiveInteger(req.query.limit, 10, 'limit', res, 100);
    if (limit === null) return;

    const filter = {};
    if (req.query.genre !== undefined) {
      if (typeof req.query.genre !== 'string' || !mongoose.isValidObjectId(req.query.genre)) {
        return res.status(400).json({
          error: 'Validation failed.',
          fields: [{ field: 'genre', message: 'Must be a valid genre id.' }],
        });
      }
      filter.genre = req.query.genre;
    }
    if (req.query.search !== undefined) {
      if (typeof req.query.search !== 'string') {
        return res.status(400).json({
          error: 'Validation failed.',
          fields: [{ field: 'search', message: 'Must be a string.' }],
        });
      }
      const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      filter.$or = [{ title: search }, { author: search }];
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate('genre', 'name slug')
        .sort({ title: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Book.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: books,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', validateObjectId(), async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('genre', 'name slug');
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    return res.status(200).json(book);
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, requireRole('librarian'), validate('book'), async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    return res.status(201).json(await book.populate('genre', 'name slug'));
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', requireAuth, requireRole('librarian'), validateObjectId(), validate('book'), async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('genre', 'name slug');
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    return res.status(200).json(book);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, requireRole('librarian'), validateObjectId(), async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;