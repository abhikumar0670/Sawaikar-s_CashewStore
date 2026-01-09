const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const { isAdmin } = require('../middleware/auth');
const { sendLowStockAlertEmail } = require('../config/email');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, sort, limit } = req.query;
    
    // Build query
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price-asc':
          sortOption.price = 1;
          break;
        case 'price-desc':
          sortOption.price = -1;
          break;
        case 'name-asc':
          sortOption.name = 1;
          break;
        case 'name-desc':
          sortOption.name = -1;
          break;
        case 'newest':
          sortOption.createdAt = -1;
          break;
        default:
          sortOption.createdAt = -1;
      }
    }
    
    let productsQuery = Product.find(query).sort(sortOption);
    
    if (limit) {
      productsQuery = productsQuery.limit(parseInt(limit));
    }
    
    const products = await productsQuery;
    
    console.log(`📦 Fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/products/alerts/low-stock
// @desc    Get products with low stock (Admin)
// @access  Private (Admin only)
router.get('/alerts/low-stock', isAdmin, async (req, res) => {
  try {
    const { threshold = 10, sendEmail = false } = req.query;
    const stockThreshold = parseInt(threshold);
    
    const lowStockProducts = await Product.find({ stock: { $lt: stockThreshold } })
      .sort({ stock: 1 })
      .select('id name price stock category image');
    
    // Send email alert if requested and there are low stock products
    let emailSent = false;
    if (sendEmail === 'true' && lowStockProducts.length > 0) {
      const emailResult = await sendLowStockAlertEmail(lowStockProducts);
      emailSent = emailResult.success;
    }
    
    res.json({
      count: lowStockProducts.length,
      threshold: stockThreshold,
      products: lowStockProducts,
      emailSent
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log(`📦 Fetched product: ${product.name}`);
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/products/add
// @desc    Create a new product with validation (Admin)
// @access  Private (Admin only)
router.post('/add', isAdmin, async (req, res) => {
  try {
    const { name, price, stock, category, rating, description, images, featured, shipping, variants, defaultWeight, priceUnit } = req.body;
    
    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: name, price, and category are required' 
      });
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Price must be a positive number' 
      });
    }

    // Validate stock
    const parsedStock = stock !== undefined && stock !== '' ? parseInt(stock) : 50;
    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Stock must be a non-negative number' 
      });
    }

    // Generate unique product ID
    const productId = `product-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Parse and validate variants
    let parsedVariants = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      parsedVariants = variants.map((v, index) => ({
        weight: v.weight,
        price: parseFloat(v.price) || parsedPrice,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || `${productId}-${v.weight}`
      }));
    }

    // Prepare product data
    const productData = {
      id: productId,
      name: name.trim(),
      price: parsedPrice,
      stock: parsedStock,
      category: category,
      rating: rating ? parseFloat(rating) : 0,
      description: description || `Premium quality ${name} from Sawaikar's Cashew Store.`,
      image: Array.isArray(images) && images.length > 0 ? images : ['./images/premium.jpg'],
      featured: featured === true || featured === 'true',
      shipping: shipping !== false && shipping !== 'false',
      company: "Sawaikar's",
      variants: parsedVariants,
      defaultWeight: defaultWeight || '250g',
      priceUnit: priceUnit || 'per kg'
    };

    const product = new Product(productData);
    await product.save();
    
    console.log(`\n✅ ===== NEW PRODUCT ADDED =====`);
    console.log(`   Name: ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Price: ₹${product.price}`);
    console.log(`   Stock: ${product.stock}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Featured: ${product.featured}`);
    console.log(`   Free Shipping: ${product.shipping}`);
    console.log(`================================\n`);
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully!',
      product: product
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Error creating product',
      error: error.message 
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Admin)
// @access  Private (Admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    console.log(`✅ Created product: ${product.name}`);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Admin)
// @access  Private (Admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log(`✅ Updated product: ${product.name}`);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin)
// @access  Private (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log(`🗑️ Deleted product: ${product.name}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private (requires user to be logged in)
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, userClerkId, userName, name } = req.body;
    const reviewerName = name || userName; // Accept both 'name' and 'userName'
    
    // Validate required fields
    if (!userClerkId || !reviewerName || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required (userClerkId, name, rating, comment)' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Verify user exists in database using userClerkId
    const user = await User.findOne({ clerkId: userClerkId });
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please sign in again.' });
    }
    
    // Find product by custom id field
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(r => r.userClerkId === userClerkId);
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Create new review object matching MongoDB schema
    const review = {
      user: user._id,
      userClerkId,
      name: reviewerName,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };
    
    // Push review to reviews array (embedded in product)
    product.reviews.push(review);
    
    // Update numReviews count
    product.numReviews = product.reviews.length;
    
    // Calculate new average rating
    const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Math.round((totalRatings / product.reviews.length) * 10) / 10;
    
    // CRUCIAL: Save to MongoDB
    await product.save();
    
    // Also save to separate Reviews collection for easy viewing
    const separateReview = new Review({
      product: product.id,
      productName: product.name,
      user: user._id,
      userClerkId,
      name: reviewerName,
      rating: Number(rating),
      comment
    });
    await separateReview.save();
    
    console.log(`⭐ Review saved to MongoDB for product: ${product.name} by ${reviewerName}`);
    console.log(`   New rating: ${product.rating}, Total reviews: ${product.numReviews}`);
    
    res.status(201).json({ 
      message: 'Review added successfully', 
      review: review,
      averageRating: product.rating,
      numReviews: product.numReviews
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/products/:id/reviews
// @desc    Get all reviews for a product
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).populate('reviews.user', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Sort reviews by newest first
    const sortedReviews = [...product.reviews].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json({
      reviews: sortedReviews,
      averageRating: product.rating,
      numReviews: product.numReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/products/:id/archive
// @desc    Archive a product (soft delete)
// @access  Private (Admin only)
router.put('/:id/archive', isAdmin, async (req, res) => {
  try {
    const { archivedBy } = req.body;
    
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.isArchived = true;
    product.archivedAt = new Date();
    product.archivedBy = archivedBy || 'Admin';
    await product.save();
    
    console.log(`📦 Product archived: ${product.name}`);
    res.json({ success: true, message: 'Product archived', product });
  } catch (error) {
    console.error('Error archiving product:', error);
    res.status(500).json({ message: 'Error archiving product', error: error.message });
  }
});

// @route   PUT /api/products/:id/restore
// @desc    Restore an archived product
// @access  Private (Admin only)
router.put('/:id/restore', isAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.isArchived = false;
    product.archivedAt = null;
    product.archivedBy = null;
    await product.save();
    
    console.log(`♻️ Product restored: ${product.name}`);
    res.json({ success: true, message: 'Product restored', product });
  } catch (error) {
    console.error('Error restoring product:', error);
    res.status(500).json({ message: 'Error restoring product', error: error.message });
  }
});

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const product = await Product.findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get products in same category, excluding current product and archived
    let related = await Product.find({
      id: { $ne: req.params.id },
      category: product.category,
      isArchived: { $ne: true }
    })
    .sort({ totalSales: -1, rating: -1 })
    .limit(parseInt(limit));
    
    // If not enough, get from other categories
    if (related.length < parseInt(limit)) {
      const remaining = parseInt(limit) - related.length;
      const additional = await Product.find({
        id: { $nin: [req.params.id, ...related.map(r => r.id)] },
        isArchived: { $ne: true }
      })
      .sort({ featured: -1, rating: -1 })
      .limit(remaining);
      
      related = [...related, ...additional];
    }
    
    res.json(related);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ message: 'Error fetching related products', error: error.message });
  }
});

// @route   POST /api/products/bulk-import
// @desc    Bulk import products from CSV data
// @access  Private (Admin only)
router.post('/bulk-import', isAdmin, async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required' });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    for (const productData of products) {
      try {
        // Generate unique ID
        const productId = productData.id || `product-${productData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        
        // Check if product already exists
        const existing = await Product.findOne({ 
          $or: [{ id: productId }, { name: productData.name }] 
        });
        
        if (existing) {
          results.failed.push({ name: productData.name, reason: 'Product already exists' });
          continue;
        }
        
        const product = new Product({
          id: productId,
          name: productData.name,
          price: parseFloat(productData.price) || 0,
          stock: parseInt(productData.stock) || 50,
          category: productData.category || 'cashews',
          description: productData.description || `Premium quality ${productData.name}`,
          image: productData.image ? [productData.image] : ['./images/premium.jpg'],
          featured: productData.featured === 'true' || productData.featured === true,
          shipping: productData.shipping !== 'false' && productData.shipping !== false,
          company: "Sawaikar's"
        });
        
        await product.save();
        results.success.push(productData.name);
      } catch (err) {
        results.failed.push({ name: productData.name || 'Unknown', reason: err.message });
      }
    }
    
    console.log(`📦 Bulk import: ${results.success.length} success, ${results.failed.length} failed`);
    res.json({
      success: true,
      message: `Imported ${results.success.length} products`,
      results
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ message: 'Error in bulk import', error: error.message });
  }
});

// @route   GET /api/products/archived
// @desc    Get all archived products (Admin)
// @access  Private (Admin only)
router.get('/archived/list', isAdmin, async (req, res) => {
  try {
    const products = await Product.find({ isArchived: true })
      .sort({ archivedAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching archived products:', error);
    res.status(500).json({ message: 'Error fetching archived products', error: error.message });
  }
});

// @route   POST /api/products/:id/view
// @desc    Record product view and update user's recently viewed
// @access  Public
router.post('/:id/view', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Increment view count
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update user's recently viewed if userId provided
    if (userId) {
      try {
        const user = await User.findOne({ clerkId: userId });
        if (user) {
          await user.addRecentlyViewed(req.params.id);
        }
      } catch (userError) {
        console.error('Error updating recently viewed:', userError);
        // Don't fail the request
      }
    }
    
    res.json({ success: true, viewCount: product.viewCount });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ message: 'Error recording view', error: error.message });
  }
});

module.exports = router;
