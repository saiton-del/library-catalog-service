const express = require('express');
const Book = require('../models/Book');
const Genre = require('../models/Genre');
const { validate, validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const genres = await Genre.find().sort({ name: 1 });
    res.status(200).json(genres);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateObjectId(), async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ error: 'Genre not found.' });
    return res.status(200).json(genre);
  } catch (error) {
    return next(error);
  }
});

router.post('/', validate('genre'), async (req, res, next) => {
  try {
    const genre = await Genre.create(req.body);
    return res.status(201).json(genre);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', validateObjectId(), validate('genre'), async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!genre) return res.status(404).json({ error: 'Genre not found.' });
    return res.status(200).json(genre);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', validateObjectId(), async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ error: 'Genre not found.' });

    if (await Book.exists({ genre: genre._id })) {
      return res.status(409).json({
        error: 'Genre is in use by one or more books and cannot be deleted.',
      });
    }

    await genre.deleteOne();
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;