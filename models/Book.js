const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
      match: /^https?:\/\/.+/i,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
      required: true,
    },
  },
  { timestamps: true },
);

bookSchema.pre('validate', function validateCopyCounts(next) {
  if (this.availableCopies > this.totalCopies) {
    this.invalidate('availableCopies', 'Cannot exceed totalCopies');
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
