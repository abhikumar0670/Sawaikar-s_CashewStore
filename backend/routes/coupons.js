const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET all coupons (admin)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// GET single coupon by code
router.get('/:code', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ message: 'Error fetching coupon', error: error.message });
  }
});

// POST - Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, userEmail, orderAmount } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({ message: 'Code and order amount are required' });
    }
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }
    
    // Check if valid
    const validation = coupon.isValid(userEmail, orderAmount);
    
    if (!validation.valid) {
      return res.status(400).json(validation);
    }
    
    // Calculate discount
    const discount = coupon.calculateDiscount(orderAmount);
    
    res.json({
      valid: true,
      message: 'Coupon applied successfully',
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
});

// POST - Apply coupon (mark as used)
router.post('/apply', async (req, res) => {
  try {
    const { code, userEmail, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    // Validate
    const validation = coupon.isValid(userEmail, orderAmount);
    if (!validation.valid) {
      return res.status(400).json(validation);
    }
    
    // Mark as used
    coupon.usedCount += 1;
    coupon.usedBy.push({
      userEmail: userEmail,
      usedAt: new Date(),
      orderAmount: orderAmount
    });
    
    await coupon.save();
    
    const discount = coupon.calculateDiscount(orderAmount);
    
    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discount: discount
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
});

// POST - Create new coupon (admin)
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      usageLimit,
      isActive,
      applicableCategories,
      excludedProducts,
      createdBy
    } = req.body;
    
    // Validate required fields
    if (!code || !description || !discountType || !discountValue || !expiryDate || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    
    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount: maxDiscount || null,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || [],
      createdBy
    });
    
    await coupon.save();
    
    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
});

// PUT - Update coupon (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Don't allow changing code or usedCount
    delete updateData.code;
    delete updateData.usedCount;
    delete updateData.usedBy;
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
});

// DELETE - Delete coupon (admin)
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
});

// PATCH - Toggle coupon active status (admin)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.json({
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon
    });
  } catch (error) {
    console.error('Error toggling coupon:', error);
    res.status(500).json({ message: 'Error toggling coupon', error: error.message });
  }
});

// GET - Coupon statistics (admin)
router.get('/stats/summary', async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ expiryDate: { $lt: new Date() } });
    
    const allCoupons = await Coupon.find();
    const totalUsed = allCoupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
    
    res.json({
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsed
    });
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
