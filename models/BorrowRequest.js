const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'returned', 'late'],
      default: 'pending',
      required: true,
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueAt: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    fine: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
