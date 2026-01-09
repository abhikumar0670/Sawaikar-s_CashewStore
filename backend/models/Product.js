const mongoose = require('mongoose');

// Schema for individual user reviews
const reviewSchema = new mongoose.Schema({
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: [String],
    default: ["./images/premium.jpg"]
  },
  category: {
    type: String,
    required: true,
    default: "cashews"
  },
  company: {
    type: String,
    default: "Sawaikar's"
  },
  description: {
    type: String,
    default: "Premium quality cashews from Goa."
  },
  colors: {
    type: [String],
    default: ["#F5DEB3", "#DEB887"]
  },
  stock: {
    type: Number,
    default: 50
  },
  numReviews: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: [reviewSchema],
    default: []
  },
  featured: {
    type: Boolean,
    default: false
  },
  shipping: {
    type: Boolean,
    default: true
  },
  // Product variants (weight options)
  variants: [{
    weight: {
      type: String,
      required: true,
      enum: ['100g', '250g', '500g', '1kg', '2kg', '5kg']
    },
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    sku: {
      type: String
    }
  }],
  // Default weight option
  defaultWeight: {
    type: String,
    default: '250g'
  },
  // Unit for the base price (for display purposes)
  priceUnit: {
    type: String,
    default: 'per kg'
  },
  // Archive for soft delete
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: String
  },
  // Related products (product IDs)
  relatedProducts: [{
    type: String
  }],
  // Tags for better categorization
  tags: [{
    type: String,
    trim: true
  }],
  // Sales data
  totalSales: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ isArchived: 1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ name: 'text', description: 'text' });

// Method to archive product
productSchema.methods.archive = function(archivedBy) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  return this.save();
};

// Method to restore product
productSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;
  return this.save();
};

// Static method to get related products
productSchema.statics.getRelated = async function(productId, limit = 4) {
  const product = await this.findOne({ id: productId });
  if (!product) return [];
  
  // Get products in same category, excluding current product and archived
  const related = await this.find({
    id: { $ne: productId },
    category: product.category,
    isArchived: { $ne: true }
  })
  .sort({ totalSales: -1, rating: -1 })
  .limit(limit);
  
  return related;
};

module.exports = mongoose.model('Product', productSchema);
