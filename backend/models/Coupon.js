const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // Only for percentage discounts
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: String
  }],
  excludedProducts: [{
    type: String
  }],
  usedBy: [{
    userEmail: String,
    usedAt: Date,
    orderAmount: Number
  }],
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function(userEmail, orderAmount) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'This coupon is no longer active' };
  }
  
  // Check expiry
  if (this.expiryDate < now) {
    return { valid: false, message: 'This coupon has expired' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
  }
  
  // Check minimum order value
  if (orderAmount < this.minOrderValue) {
    return { valid: false, message: `Minimum order value of ₹${this.minOrderValue} required` };
  }
  
  return { valid: true, message: 'Coupon is valid' };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }
  
  // Discount cannot exceed order amount
  if (discount > orderAmount) {
    discount = orderAmount;
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Update timestamp on save
couponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);
