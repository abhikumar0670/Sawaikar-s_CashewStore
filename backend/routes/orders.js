const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { 
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail
} = require('../config/email');
const { isAdmin } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders (Admin) or user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { email, status, limit = 50, includeArchived } = req.query;
    
    let query = {};
    
    // Exclude archived by default
    if (includeArchived !== 'true') {
      query.isArchived = { $ne: true };
    }
    
    if (email) {
      query.userEmail = email.toLowerCase();
    }
    
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    console.log(`📋 Fetched ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get single order by order ID
// @access  Private
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a new order and send confirmation email
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      userId,           // Clerk ID
      userEmail,
      userName,
      userPhone,
      shippingInfo,     // New structured shipping info
      shippingAddress,  // Legacy field
      items,
      totalAmount,
      totalPrice,       // Alias
      shippingFee,
      paymentInfo,      // New structured payment info
      paymentStatus,
      paymentMethod,
      transactionId,
      paidAt,
      notes
    } = req.body;
    
    // Validate required fields
    if (!userEmail) {
      return res.status(400).json({ message: 'User email is required' });
    }
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    const amount = totalAmount || totalPrice;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid total amount is required' });
    }
    
    // Determine payment status from paymentInfo or direct field
    let finalPaymentStatus = paymentStatus || 'pending';
    let finalPaymentMethod = paymentMethod || 'upi';
    let finalTransactionId = transactionId || '';
    
    if (paymentInfo) {
      finalPaymentStatus = paymentInfo.status || finalPaymentStatus;
      finalPaymentMethod = paymentInfo.type || finalPaymentMethod;
      finalTransactionId = paymentInfo.id || finalTransactionId;
    }
    
    // Create new order
    const order = new Order({
      userId,
      userEmail,
      userName,
      userPhone,
      shippingInfo: shippingInfo || shippingAddress,
      shippingAddress,
      items,
      totalAmount: amount,
      totalPrice: amount,
      shippingFee: shippingFee || 0,
      paymentInfo,
      paymentStatus: finalPaymentStatus,
      paymentMethod: finalPaymentMethod,
      transactionId: finalTransactionId,
      paidAt: finalPaymentStatus === 'completed' ? (paidAt || new Date()) : null,
      notes
    });
    
    await order.save();
    console.log(`✅ Order created: ${order.orderId} for user ${userEmail}`);
    
    // If userId (Clerk ID) is provided, push order to User's orders array
    if (userId) {
      try {
        const userUpdate = await User.findOneAndUpdate(
          { clerkId: userId },
          { $push: { orders: order._id } },
          { new: true }
        );
        if (userUpdate) {
          console.log(`✅ Order ${order.orderId} linked to user ${userId}`);
        } else {
          console.log(`⚠️ User with clerkId ${userId} not found - order not linked`);
        }
      } catch (userError) {
        console.error('Error linking order to user:', userError.message);
        // Don't fail the order creation if user linking fails
      }
    }
    
    // Send confirmation email for successful orders
    let emailResult = { success: false };
    if (finalPaymentStatus === 'completed') {
      emailResult = await sendOrderConfirmationEmail(order);
    }
    
    res.status(201).json({
      message: 'Order placed successfully',
      order,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

// Status messages for timeline
const statusMessages = {
  placed: 'Order placed successfully',
  confirmed: 'Order has been confirmed',
  processing: 'Order is being processed',
  shipped: 'Order has been shipped',
  out_for_delivery: 'Order is out for delivery',
  delivered: 'Order has been delivered',
  cancelled: 'Order has been cancelled',
  returned: 'Order has been returned'
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status by MongoDB _id
// @access  Private (Admin only)
router.put('/:id/status', isAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    // Find order first (by _id or orderId)
    let order = await Order.findById(req.params.id);
    if (!order) {
      order = await Order.findOne({ orderId: req.params.id });
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status and add to timeline
    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.addStatusUpdate(
        orderStatus,
        statusMessages[orderStatus] || `Order status updated to ${orderStatus}`,
        '',
        'Admin'
      );
      
      // Set actual delivery date if delivered
      if (orderStatus === 'delivered') {
        order.actualDeliveryDate = new Date();
      }
    }
    
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'completed' && !order.paidAt) {
        order.paidAt = new Date();
      }
    }
    
    await order.save();
    
    console.log(`✅ Order status updated: ${order.orderId} -> ${orderStatus || paymentStatus}`);
    
    // Send status update emails
    if (orderStatus === 'shipped') {
      sendOrderShippedEmail(order).catch(err => console.error('Email error:', err));
    } else if (orderStatus === 'delivered') {
      sendOrderDeliveredEmail(order).catch(err => console.error('Email error:', err));
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(400).json({ message: 'Error updating order status', error: error.message });
  }
});

// @route   PUT /api/orders/:orderId
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:orderId', isAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, transactionId } = req.body;
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status and add to timeline
    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.addStatusUpdate(
        orderStatus,
        statusMessages[orderStatus] || `Order status updated to ${orderStatus}`,
        '',
        'Admin'
      );
      
      // Set actual delivery date if delivered
      if (orderStatus === 'delivered') {
        order.actualDeliveryDate = new Date();
      }
    }
    
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'completed' && !order.paidAt) {
        order.paidAt = new Date();
      }
    }
    
    if (transactionId) {
      order.transactionId = transactionId;
    }
    
    await order.save();
    
    console.log(`✅ Order updated: ${order.orderId}`);
    
    // Send status update emails
    if (orderStatus === 'shipped') {
      sendOrderShippedEmail(order).catch(err => console.error('Email error:', err));
    } else if (orderStatus === 'delivered') {
      sendOrderDeliveredEmail(order).catch(err => console.error('Email error:', err));
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

// @route   DELETE /api/orders/:orderId
// @desc    Cancel/Delete an order
// @access  Private
router.delete('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only allow cancellation of pending orders
    if (order.orderStatus !== 'placed' && order.orderStatus !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that is already being processed' 
      });
    }
    
    order.orderStatus = 'cancelled';
    order.addStatusUpdate('cancelled', 'Order cancelled by customer', '', 'Customer');
    await order.save();
    
    console.log(`🗑️ Order cancelled: ${order.orderId}`);
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/orders/bulk-update
// @desc    Bulk update order statuses (Admin)
// @access  Private (Admin only)
router.post('/bulk-update', isAdmin, async (req, res) => {
  try {
    const { orderIds, orderStatus, updatedBy } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'Order IDs array is required' });
    }
    
    if (!orderStatus) {
      return res.status(400).json({ message: 'New status is required' });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    for (const orderId of orderIds) {
      try {
        const order = await Order.findOne({ 
          $or: [{ orderId }, { _id: orderId }] 
        });
        
        if (order) {
          if (orderStatus !== order.orderStatus) {
            order.orderStatus = orderStatus;
            order.addStatusUpdate(
              orderStatus, 
              statusMessages[orderStatus] || `Status updated to ${orderStatus}`, 
              '', 
              updatedBy || 'Admin'
            );
            
            // Set actual delivery date if delivered
            if (orderStatus === 'delivered') {
              order.actualDeliveryDate = new Date();
            }
          }
          await order.save();
          results.success.push(orderId);
        } else {
          results.failed.push({ orderId, reason: 'Not found' });
        }
      } catch (err) {
        results.failed.push({ orderId, reason: err.message });
      }
    }
    
    console.log(`📦 Bulk updated ${results.success.length} orders to ${orderStatus}`);
    res.json({
      success: true,
      message: `Updated ${results.success.length} orders`,
      results
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ message: 'Error in bulk update', error: error.message });
  }
});

// @route   POST /api/orders/:orderId/notes
// @desc    Add admin note to order
// @access  Private (Admin only)
router.post('/:orderId/notes', isAdmin, async (req, res) => {
  try {
    const { note, addedBy, isInternal } = req.body;
    
    if (!note) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.adminNotes.push({
      note,
      addedBy: addedBy || 'Admin',
      isInternal: isInternal !== false
    });
    
    await order.save();
    
    console.log(`📝 Note added to order ${order.orderId}`);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Error adding note', error: error.message });
  }
});

// @route   DELETE /api/orders/:orderId/notes/:noteId
// @desc    Delete admin note from order
// @access  Private (Admin only)
router.delete('/:orderId/notes/:noteId', isAdmin, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.adminNotes = order.adminNotes.filter(
      n => n._id.toString() !== req.params.noteId
    );
    
    await order.save();
    
    res.json({ success: true, message: 'Note deleted', order });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// @route   PUT /api/orders/:orderId/tracking
// @desc    Update tracking info
// @access  Private (Admin only)
router.put('/:orderId/tracking', isAdmin, async (req, res) => {
  try {
    const { trackingNumber, shippingCarrier, statusMessage, location, updatedBy } = req.body;
    
    const order = await Order.findOne({ orderId: req.params.orderId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (shippingCarrier) order.shippingCarrier = shippingCarrier;
    
    // Add to timeline
    order.addStatusUpdate(
      order.orderStatus,
      statusMessage || `Tracking updated: ${trackingNumber}`,
      location || '',
      updatedBy || 'Admin'
    );
    
    await order.save();
    
    console.log(`📍 Tracking updated for ${order.orderId}: ${trackingNumber}`);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating tracking:', error);
    res.status(500).json({ message: 'Error updating tracking', error: error.message });
  }
});

// @route   GET /api/orders/:orderId/timeline
// @desc    Get order status timeline
// @access  Private
router.get('/:orderId/timeline', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('orderId orderStatus statusTimeline estimatedDeliveryDate actualDeliveryDate trackingNumber shippingCarrier');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      orderId: order.orderId,
      currentStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      shippingCarrier: order.shippingCarrier,
      estimatedDelivery: order.estimatedDeliveryDate,
      actualDelivery: order.actualDeliveryDate,
      timeline: order.statusTimeline
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ message: 'Error fetching timeline', error: error.message });
  }
});

// @route   POST /api/orders/:orderId/reorder
// @desc    Create a new order with same items as previous order
// @access  Private
router.post('/:orderId/reorder', async (req, res) => {
  try {
    const { userEmail, userId, userName, shippingInfo } = req.body;
    
    const originalOrder = await Order.findOne({ orderId: req.params.orderId });
    
    if (!originalOrder) {
      return res.status(404).json({ message: 'Original order not found' });
    }
    
    // Verify items are still available
    const itemsToOrder = [];
    const unavailableItems = [];
    
    for (const item of originalOrder.items) {
      const product = await Product.findOne({ id: item.productId, isArchived: { $ne: true } });
      
      if (product && product.stock >= item.quantity) {
        itemsToOrder.push({
          productId: item.productId,
          name: item.name,
          price: product.price, // Use current price
          quantity: item.quantity,
          image: item.image,
          color: item.color,
          weight: item.weight
        });
      } else if (product) {
        unavailableItems.push({ name: item.name, reason: 'Insufficient stock' });
      } else {
        unavailableItems.push({ name: item.name, reason: 'Product no longer available' });
      }
    }
    
    if (itemsToOrder.length === 0) {
      return res.status(400).json({ 
        message: 'These items will be added soon... Stock is being processed!',
        unavailableItems
      });
    }
    
    // Calculate new total
    const totalAmount = itemsToOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = totalAmount >= 200000 ? 0 : 15000; // Free shipping over ₹2000
    
    res.json({
      success: true,
      message: unavailableItems.length > 0 
        ? 'Some items are unavailable' 
        : 'Ready to reorder',
      reorderData: {
        items: itemsToOrder,
        totalAmount: totalAmount + shippingFee,
        shippingFee,
        originalOrderId: req.params.orderId,
        unavailableItems
      }
    });
  } catch (error) {
    console.error('Error preparing reorder:', error);
    res.status(500).json({ message: 'Error preparing reorder', error: error.message });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics for admin
// @access  Private (Admin only)
router.get('/stats/summary', isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments({ ...dateFilter, isArchived: { $ne: true } }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'delivered', isArchived: { $ne: true } }),
      Order.countDocuments({ ...dateFilter, orderStatus: { $in: ['placed', 'confirmed', 'processing'] }, isArchived: { $ne: true } }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'cancelled', isArchived: { $ne: true } }),
      Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'completed', isArchived: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    res.json({
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageOrderValue: totalOrders > 0 ? (totalRevenue[0]?.total || 0) / totalOrders : 0
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// @route   GET /api/orders/analytics/dashboard
// @desc    Get comprehensive analytics for admin dashboard
// @access  Private (Admin only)
router.get('/analytics/dashboard', isAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get orders for different time periods
    const [
      todayOrders,
      weekOrders,
      monthOrders,
      yearOrders,
      recentOrders,
      topProducts,
      ordersByStatus,
      salesByDay
    ] = await Promise.all([
      // Today's stats
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, paymentStatus: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      // This week's stats
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek }, paymentStatus: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      // This month's stats
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      // This year's stats
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfYear }, paymentStatus: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]),
      // Recent 10 orders
      Order.find({}).sort({ createdAt: -1 }).limit(10).select('orderId userName totalAmount orderStatus createdAt'),
      // Top selling products
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]),
      // Orders by status
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      // Sales by day (last 7 days)
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, paymentStatus: 'completed' } },
        { $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      today: { orders: todayOrders[0]?.count || 0, revenue: todayOrders[0]?.revenue || 0 },
      thisWeek: { orders: weekOrders[0]?.count || 0, revenue: weekOrders[0]?.revenue || 0 },
      thisMonth: { orders: monthOrders[0]?.count || 0, revenue: monthOrders[0]?.revenue || 0 },
      thisYear: { orders: yearOrders[0]?.count || 0, revenue: yearOrders[0]?.revenue || 0 },
      recentOrders,
      topProducts: topProducts.map(p => ({ name: p._id, sold: p.totalSold, revenue: p.revenue / 100 })),
      ordersByStatus: ordersByStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
      salesByDay: salesByDay.map(d => ({ date: d._id, orders: d.orders, revenue: d.revenue }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;
