const mongoose = require('mongoose');
const Genre = require('../models/Genre');

const bookFields = new Set([
  'title', 'author', 'isbn', 'description', 'coverImage',
  'totalCopies', 'availableCopies', 'genre',
]);
const genreFields = new Set(['name', 'slug']);

function badRequest(res, field, message) {
  return res.status(400).json({
    error: 'Validation failed.',
    fields: [{ field, message }],
  });
}

function validate(schemaName) {
  const allowedFields = schemaName === 'book' ? bookFields : genreFields;
  const requiredFields = [...allowedFields];

  return async (req, res, next) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return badRequest(res, 'body', 'Must be a JSON object.');
    }

    const entries = Object.entries(req.body);
    if (entries.length === 0) {
      return badRequest(res, 'body', 'Must include the required fields.');
    }

    const unknownField = entries.find(([field]) => !allowedFields.has(field));
    if (unknownField) {
      return badRequest(res, unknownField[0], 'Unknown field.');
    }

    const missingField = requiredFields.find((field) => (
      !Object.prototype.hasOwnProperty.call(req.body, field)
      || req.body[field] === null
      || req.body[field] === undefined
      || (typeof req.body[field] === 'string' && req.body[field].trim() === '')
    ));
    if (missingField) {
      return badRequest(res, missingField, 'This field is required.');
    }

    for (const field of ['title', 'author', 'isbn', 'description', 'coverImage', 'name', 'slug']) {
      if (Object.prototype.hasOwnProperty.call(req.body, field) && typeof req.body[field] !== 'string') {
        return badRequest(res, field, 'Must be a string.');
      }
    }

    if (schemaName === 'book') {
      for (const field of ['totalCopies', 'availableCopies']) {
        if (typeof req.body[field] !== 'number' || !Number.isInteger(req.body[field]) || req.body[field] < 0) {
          return badRequest(res, field, 'Must be a non-negative integer.');
        }
      }
      if (req.body.availableCopies > req.body.totalCopies) {
        return badRequest(res, 'availableCopies', 'Cannot exceed totalCopies.');
      }
      if (!/^https?:\/\/.+/i.test(req.body.coverImage.trim())) {
        return badRequest(res, 'coverImage', 'Must be a valid HTTP or HTTPS URL.');
      }
      if (typeof req.body.genre !== 'string' || !mongoose.isValidObjectId(req.body.genre)) {
        return badRequest(res, 'genre', 'Must be a valid genre id.');
      }
      try {
        if (!(await Genre.exists({ _id: req.body.genre }))) {
          return badRequest(res, 'genre', 'Genre does not exist.');
        }
      } catch (error) {
        return next(error);
      }
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.body.slug.trim().toLowerCase())) {
      return badRequest(res, 'slug', 'Must contain lowercase letters, numbers, and single hyphens only.');
    }

    next();
  };
}

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[paramName])) {
      return badRequest(res, paramName, 'Must be a valid ObjectId.');
    }
    next();
  };
}

module.exports = { validate, validateObjectId };