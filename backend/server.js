const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');
const couponRoutes = require('./routes/coupons');
const newsletterRoutes = require('./routes/newsletter');
const Product = require('./models/Product');
const User = require('./models/User');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ===============================================
// 🔒 SECURITY & PERFORMANCE MIDDLEWARE
// ===============================================

// Security headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable CSP for API
}));

// Response compression for faster loading
app.use(compression());

// Rate limiting - prevent abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for auth/payment routes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/payment', strictLimiter);
app.use('/api/users', strictLimiter);

// ===============================================
// CORE MIDDLEWARE
// ===============================================

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to Sawaikar's Cashew Store API",
    version: '2.0.0',
    endpoints: {
      products: {
        getAll: 'GET /api/products',
        getOne: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        archive: 'PUT /api/products/:id/archive',
        restore: 'PUT /api/products/:id/restore',
        related: 'GET /api/products/:id/related',
        bulkImport: 'POST /api/products/bulk-import',
        recordView: 'POST /api/products/:id/view',
        archivedList: 'GET /api/products/archived/list'
      },
      orders: {
        getAll: 'GET /api/orders',
        getOne: 'GET /api/orders/:orderId',
        create: 'POST /api/orders',
        update: 'PUT /api/orders/:orderId',
        cancel: 'DELETE /api/orders/:orderId',
        bulkUpdate: 'POST /api/orders/bulk-update',
        addNote: 'POST /api/orders/:orderId/notes',
        deleteNote: 'DELETE /api/orders/:orderId/notes/:noteId',
        updateTracking: 'PUT /api/orders/:orderId/tracking',
        getTimeline: 'GET /api/orders/:orderId/timeline',
        reorder: 'POST /api/orders/:orderId/reorder',
        stats: 'GET /api/orders/stats/summary'
      },
      users: {
        sync: 'POST /api/users/sync',
        getByClerkId: 'GET /api/users/:clerkId',
        getAll: 'GET /api/users',
        updateRole: 'PATCH /api/users/:clerkId/role',
        addOrder: 'PATCH /api/users/:clerkId/add-order',
        addresses: {
          getAll: 'GET /api/users/:clerkId/addresses',
          add: 'POST /api/users/:clerkId/addresses',
          update: 'PUT /api/users/:clerkId/addresses/:addressId',
          delete: 'DELETE /api/users/:clerkId/addresses/:addressId',
          setDefault: 'PUT /api/users/:clerkId/addresses/:addressId/default'
        },
        recentlyViewed: {
          get: 'GET /api/users/:clerkId/recently-viewed',
          add: 'POST /api/users/:clerkId/recently-viewed',
          clear: 'DELETE /api/users/:clerkId/recently-viewed'
        }
      },
      newsletter: {
        subscribe: 'POST /api/newsletter/subscribe',
        unsubscribe: 'POST /api/newsletter/unsubscribe',
        getSubscribers: 'GET /api/newsletter/subscribers',
        updatePreferences: 'PUT /api/newsletter/:id/preferences',
        delete: 'DELETE /api/newsletter/:id',
        export: 'GET /api/newsletter/export'
      },
      utility: {
        seed: 'POST /api/seed',
        health: 'GET /api/health'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Email test endpoint (for debugging)
app.get('/api/test-email', async (req, res) => {
  try {
    const { sendOrderConfirmationEmail } = require('./config/email');
    
    // Check environment variables
    const emailConfig = {
      EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
      EMAIL_PASS: process.env.EMAIL_PASS ? `Set (${process.env.EMAIL_PASS.length} chars)` : 'Missing',
      EMAIL_HOST: process.env.EMAIL_HOST || 'Not set (using default)',
    };
    
    console.log('📧 Email config check:', emailConfig);
    
    // Try sending a test email
    const testOrder = {
      orderId: 'TEST-' + Date.now(),
      userEmail: process.env.EMAIL_USER, // Send to self for testing
      userName: 'Test User',
      items: [{ name: 'Test Product', quantity: 1, price: 10000 }],
      totalAmount: 10000,
      shippingFee: 0,
      paymentStatus: 'completed',
      transactionId: 'test_txn_123',
      shippingAddress: { name: 'Test', street: '123 Test St', city: 'Test City', state: 'Test', pincode: '123456' },
      createdAt: new Date()
    };
    
    const result = await sendOrderConfirmationEmail(testOrder);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Email failed',
      emailConfig,
      error: result.error || null
    });
  } catch (error) {
    console.error('❌ Email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Seed data endpoint (for convenience)
app.post('/api/seed', async (req, res) => {
  try {
    const sampleProducts = [
      {
        id: "sawaikar-premium-w240",
        name: "Premium Whole Cashews W240",
        price: 89900,
        image: ["./images/premium.jpg", "./images/cashew2.jpg", "./images/cashew3.jpg"],
        category: "cashews",
        company: "Sawaikar's",
        description: "Premium grade W240 whole cashews from Goa. These large-sized cashews are hand-picked and processed to ensure the highest quality.",
        colors: ["#F5DEB3", "#DEB887", "#D2B48C"],
        stock: 100,
        reviews: 156,
        stars: 4.8,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-premium-w320",
        name: "Premium Whole Cashews W320",
        price: 79900,
        image: ["./images/w320.jpg", "./images/cashew2.jpg"],
        category: "cashews",
        company: "Sawaikar's",
        description: "High-quality W320 grade whole cashews. Medium-sized with excellent taste and texture.",
        colors: ["#F5DEB3", "#DEB887"],
        stock: 150,
        reviews: 203,
        stars: 4.7,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-roasted-salted",
        name: "Roasted & Salted Cashews",
        price: 94900,
        image: ["./images/roasted.jpg", "./images/roasted2.jpg"],
        category: "roasted",
        company: "Sawaikar's",
        description: "Perfectly roasted and lightly salted cashews. Crispy, flavorful, and irresistibly delicious.",
        colors: ["#CD853F", "#D2691E"],
        stock: 80,
        reviews: 178,
        stars: 4.9,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-masala-cashews",
        name: "Masala Cashews",
        price: 99900,
        image: ["./images/masala.jpg", "./images/masala2.jpg"],
        category: "flavored",
        company: "Sawaikar's",
        description: "Spicy masala-coated cashews with authentic Indian spices.",
        colors: ["#B8860B", "#CD853F"],
        stock: 60,
        reviews: 142,
        stars: 4.6,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-pepper-cashews",
        name: "Black Pepper Cashews",
        price: 97900,
        image: ["./images/pepper.jpg"],
        category: "flavored",
        company: "Sawaikar's",
        description: "Cashews coated with freshly ground black pepper.",
        colors: ["#2F4F4F", "#696969"],
        stock: 70,
        reviews: 98,
        stars: 4.5,
        featured: false,
        shipping: true
      },
      {
        id: "sawaikar-honey-cashews",
        name: "Honey Glazed Cashews",
        price: 109900,
        image: ["./images/honey.jpg", "./images/honey2.jpg"],
        category: "flavored",
        company: "Sawaikar's",
        description: "Sweet and crunchy honey-glazed cashews made with pure organic honey.",
        colors: ["#FFD700", "#FFA500"],
        stock: 50,
        reviews: 167,
        stars: 4.8,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-cashew-pieces",
        name: "Cashew Pieces (Broken)",
        price: 54900,
        image: ["./images/pieces.jpg"],
        category: "cashews",
        company: "Sawaikar's",
        description: "Budget-friendly broken cashew pieces. Perfect for cooking and baking.",
        colors: ["#F5DEB3", "#DEB887"],
        stock: 200,
        reviews: 289,
        stars: 4.4,
        featured: false,
        shipping: true
      },
      {
        id: "sawaikar-jumbo-w180",
        name: "Jumbo Cashews W180",
        price: 129900,
        image: ["./images/jumbo.jpg", "./images/jumbo2.jpg"],
        category: "cashews",
        company: "Sawaikar's",
        description: "Extra-large W180 grade jumbo cashews. The king of cashews.",
        colors: ["#F5DEB3", "#FAEBD7"],
        stock: 40,
        reviews: 87,
        stars: 4.9,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-gift-hamper-premium",
        name: "Premium Dry Fruits Hamper",
        price: 249900,
        image: ["./images/hamper1.jpg", "./images/hamper2.jpg", "./images/hamper3.jpg"],
        category: "hampers",
        company: "Sawaikar's",
        description: "Luxurious gift hamper containing premium whole cashews, roasted almonds, pistachios, and raisins.",
        colors: ["#8B4513", "#A0522D"],
        stock: 30,
        reviews: 124,
        stars: 4.9,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-gift-hamper-royal",
        name: "Royal Celebration Hamper",
        price: 399900,
        image: ["./images/royal-hamper.jpg", "./images/royal-hamper2.jpg"],
        category: "hampers",
        company: "Sawaikar's",
        description: "Our most premium gift hamper. Perfect for weddings and festivals.",
        colors: ["#800000", "#B22222"],
        stock: 20,
        reviews: 56,
        stars: 5.0,
        featured: true,
        shipping: true
      },
      {
        id: "sawaikar-cashew-butter",
        name: "Natural Cashew Butter",
        price: 69900,
        image: ["./images/butter.jpg"],
        category: "spreads",
        company: "Sawaikar's",
        description: "Creamy, smooth cashew butter made from 100% roasted cashews.",
        colors: ["#DEB887", "#D2B48C"],
        stock: 45,
        reviews: 93,
        stars: 4.6,
        featured: false,
        shipping: true
      },
      {
        id: "sawaikar-raw-organic",
        name: "Organic Raw Cashews",
        price: 99900,
        image: ["./images/organic.jpg", "./images/organic2.jpg"],
        category: "cashews",
        company: "Sawaikar's",
        description: "Certified organic raw cashews. Unroasted and unsalted.",
        colors: ["#228B22", "#32CD32"],
        stock: 65,
        reviews: 112,
        stars: 4.7,
        featured: false,
        shipping: true
      }
    ];

    // Clear existing and insert new
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    
    console.log(`✅ Seeded ${inserted.length} products via API`);
    res.json({
      message: 'Database seeded successfully',
      productsCount: inserted.length,
      products: inserted.map(p => ({ id: p.id, name: p.name, price: p.price }))
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ message: 'Error seeding database', error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(50));
  console.log(`🥜 Sawaikar's Cashew Store API Server`);
  console.log('═'.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📦 API Base: http://localhost:${PORT}/api`);
  console.log('═'.repeat(50) + '\n');
});

module.exports = app;
