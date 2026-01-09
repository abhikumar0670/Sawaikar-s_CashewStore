const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: String,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userClerkId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
reviewSchema.index({ product: 1 });
reviewSchema.index({ userClerkId: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
