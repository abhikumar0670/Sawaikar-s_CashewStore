const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  },
  color: {
    type: String
  },
  weight: {
    type: String
  }
});

const shippingInfoSchema = new mongoose.Schema({
  address: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  pincode: { type: String },
  country: { type: String, default: "India" },
  phone: { type: String }
}, { _id: false });

const paymentInfoSchema = new mongoose.Schema({
  id: { type: String },          // Transaction ID
  status: { type: String },       // completed, failed, pending
  type: { type: String },         // upi, card, netbanking, cod
  method: { type: String },       // Visa, MasterCard, GPay, etc.
  upiId: { type: String },        // UPI ID (e.g., user@okaxis)
  vpa: { type: String },          // UPI Virtual Payment Address
  bank: { type: String },         // Bank name for netbanking
  cardLast4: { type: String },    // Last 4 digits of card
  network: { type: String },      // Card network (Visa, Mastercard, etc.)
  wallet: { type: String }        // Wallet provider (PayTM, PhonePe, etc.)
}, { _id: false });

// Status timeline for order tracking
const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  location: {
    type: String
  },
  updatedBy: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Admin notes schema
const adminNoteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true
  },
  addedBy: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  isInternal: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Clerk User ID for linking to User document
  userId: {
    type: String,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userName: {
    type: String,
    trim: true
  },
  userPhone: {
    type: String,
    trim: true
  },
  // Guest checkout flag
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  // New structured shipping info
  shippingInfo: shippingInfoSchema,
  // Legacy field for backward compatibility
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" }
  },
  // Order items (products)
  items: [orderItemSchema],
  // Pricing
  totalAmount: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number  // Alias for totalAmount for compatibility
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  // Coupon applied
  couponCode: {
    type: String
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  // New structured payment info
  paymentInfo: paymentInfoSchema,
  // Legacy payment fields for backward compatibility
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking', 'cod', 'wallet', 'razorpay'],
    default: 'upi'
  },
  transactionId: {
    type: String
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  // Order status
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'placed'
  },
  // Status timeline for tracking
  statusTimeline: [statusTimelineSchema],
  // Estimated delivery
  estimatedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  // Shipping tracking
  trackingNumber: {
    type: String
  },
  shippingCarrier: {
    type: String,
    enum: ['BlueDart', 'DTDC', 'Delhivery', 'India Post', 'FedEx', 'Ekart', 'Other'],
    default: 'BlueDart'
  },
  // Admin notes
  adminNotes: [adminNoteSchema],
  // Customer notes (visible to customer)
  customerNotes: {
    type: String
  },
  // Payment timestamp
  paidAt: {
    type: Date
  },
  // Legacy notes field
  notes: {
    type: String
  },
  // Archived flag for soft delete
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate estimated delivery date (3-7 business days based on location)
orderSchema.methods.calculateEstimatedDelivery = function() {
  const today = new Date();
  const city = this.shippingInfo?.city || this.shippingAddress?.city || '';
  
  // Metro cities: 3-4 days, others: 5-7 days
  const metroCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'goa', 'panaji', 'margao'];
  const isMetro = metroCities.some(metro => city.toLowerCase().includes(metro));
  
  const daysToAdd = isMetro ? 4 : 7;
  const estimatedDate = new Date(today);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
  
  // Skip Sundays
  if (estimatedDate.getDay() === 0) {
    estimatedDate.setDate(estimatedDate.getDate() + 1);
  }
  
  return estimatedDate;
};

// Add status to timeline
orderSchema.methods.addStatusUpdate = function(status, message, location, updatedBy) {
  this.statusTimeline.push({
    status,
    message: message || `Order ${status}`,
    location: location || '',
    updatedBy: updatedBy || 'System',
    timestamp: new Date()
  });
};

// Generate unique order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderId = `SC-${timestamp}-${random}`;
  }
  
  // Sync totalPrice with totalAmount
  if (this.totalAmount && !this.totalPrice) {
    this.totalPrice = this.totalAmount;
  }
  
  // Set paidAt when payment is completed
  if (this.paymentStatus === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  // Calculate estimated delivery if not set
  if (!this.estimatedDeliveryDate && this.paymentStatus === 'completed') {
    this.estimatedDeliveryDate = this.calculateEstimatedDelivery();
  }
  
  // Add initial status to timeline if empty
  if (this.statusTimeline.length === 0) {
    this.statusTimeline.push({
      status: 'placed',
      message: 'Order placed successfully',
      timestamp: new Date()
    });
  }
  
  next();
});

// Index for faster queries
orderSchema.index({ userEmail: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Order', orderSchema);
