const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    default: 'Home',
    enum: ['Home', 'Work', 'Other']
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: true, timestamps: true });

const recentlyViewedSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  viewedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  addresses: [addressSchema],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  recentlyViewed: [recentlyViewedSchema],
  newsletterSubscribed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Method to add recently viewed product (max 20 items)
userSchema.methods.addRecentlyViewed = async function(productId) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(rv => rv.productId !== productId);
  
  // Add to beginning
  this.recentlyViewed.unshift({ productId, viewedAt: new Date() });
  
  // Keep only last 20
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  
  await this.save();
};

// Method to get default address
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

module.exports = mongoose.model('User', userSchema);
