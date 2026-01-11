const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../config/email');
require('dotenv').config();

// Initialize Razorpay instance with your Test API Keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order
 * Body: { amount: number (in rupees) }
 * Returns: { orderId, currency, amount, keyId }
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Amount must be greater than 0.'
      });
    }

    // Convert amount from rupees to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order options
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    // Create order using Razorpay API
    const order = await razorpay.orders.create(options);

    console.log('✅ Razorpay Order Created:', order.id);

    // Return order details to frontend
    res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID // Send Key ID to frontend for checkout
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order. Please try again.'
    });
  }
});

/**
 * POST /api/payment/verify
 * Legacy verify endpoint - kept for backward compatibility
 * Body: { orderId, paymentId, signature }
 * Returns: { success: boolean }
 */
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Create signature verification string
    const body = orderId + "|" + paymentId;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Compare signatures
    const isAuthentic = expectedSignature === signature;

    if (isAuthentic) {
      console.log('✅ Payment Verified Successfully');
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      console.log('❌ Payment Verification Failed');
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification error'
    });
  }
});

/**
 * POST /api/payment/verify-payment
 * Comprehensive payment verification with order creation and cart clearing
 * Body: {
 *   razorpay_order_id, 
 *   razorpay_payment_id, 
 *   razorpay_signature,
 *   orderData: { user, items, totalAmount, shippingAddress }
 * }
 * Returns: { success: boolean, orderId: string }
 */
router.post('/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderData 
    } = req.body;

    // Validate required payment parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing Razorpay parameters');
      return res.status(400).json({
        success: false,
        error: 'Missing required payment parameters'
      });
    }

    if (!orderData || !orderData.user || !orderData.items) {
      console.error('❌ Missing orderData parameters');
      return res.status(400).json({
        success: false,
        error: 'Missing required order data'
      });
    }

    // Step 1: Verify Razorpay signature (CRUCIAL SECURITY STEP)
    const signatureBody = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Payment signature verification failed');
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Payment verification failed.'
      });
    }

    // Step 2: Fetch Payment Details from Razorpay
    let paymentInfo = {
      id: razorpay_payment_id,
      status: 'completed',
      type: 'upi', // default
      method: 'Razorpay'
    };

    try {
      const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      
      // Extract payment method details
      paymentInfo.type = paymentDetails.method || 'upi';
      paymentInfo.status = paymentDetails.status === 'captured' ? 'completed' : paymentDetails.status;
      
      // UPI Payment
      if (paymentDetails.method === 'upi') {
        paymentInfo.method = 'UPI';
        paymentInfo.upiId = paymentDetails.vpa || null;
        paymentInfo.vpa = paymentDetails.vpa || null;
      }
      // Card Payment
      else if (paymentDetails.method === 'card') {
        paymentInfo.method = 'Card';
        if (paymentDetails.card) {
          paymentInfo.cardLast4 = paymentDetails.card.last4 || null;
          paymentInfo.network = paymentDetails.card.network || null;
        }
      }
      // Netbanking Payment
      else if (paymentDetails.method === 'netbanking') {
        paymentInfo.method = 'Netbanking';
        paymentInfo.bank = paymentDetails.bank || null;
      }
      // Wallet Payment
      else if (paymentDetails.method === 'wallet') {
        paymentInfo.method = 'Wallet';
        paymentInfo.wallet = paymentDetails.wallet || null;
      }
    } catch (fetchError) {
      // Continue with default payment info if Razorpay fetch fails
    }

    // Step 3: Create Order in MongoDB
    const Order = require('../models/Order');
    
    // Prepare order object
    const orderObject = {
      userId: orderData.user.clerkId,
      userEmail: orderData.user.email,
      userName: orderData.user.name,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: paymentInfo.type || 'razorpay',
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentInfo: paymentInfo,
      paidAt: new Date()
    };

    const newOrder = new Order(orderObject);
    
    try {
      await newOrder.save();
    } catch (saveError) {
      console.error('❌ Order save error:', saveError.message);
      throw saveError;
    }

    // Step 4: Send response immediately (don't wait for email)
    res.status(200).json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: newOrder.orderId,
      mongoOrderId: newOrder._id,
      emailSent: 'pending' // Email will be sent asynchronously
    });

    // Step 5: Send Order Confirmation Email ASYNCHRONOUSLY (after response)
    // This prevents the email from blocking the response
    setImmediate(async () => {
      try {
        // Fetch user from database to get the most accurate email
        let userEmail = orderData.user.email;
        let userName = orderData.user.name || 'Valued Customer';
        
        if (orderData.user.clerkId) {
          const dbUser = await User.findOne({ clerkId: orderData.user.clerkId });
          if (dbUser && dbUser.email) {
            userEmail = dbUser.email;
            userName = dbUser.name || userName;
          }
        }
        
        // Prepare order object for email
        const orderForEmail = {
          orderId: newOrder.orderId,
          userEmail: userEmail,
          userName: userName,
          items: newOrder.items,
          totalAmount: newOrder.totalAmount,
          shippingFee: newOrder.shippingFee || 0,
          paymentStatus: newOrder.paymentStatus,
          transactionId: newOrder.transactionId,
          shippingAddress: newOrder.shippingAddress,
          createdAt: newOrder.createdAt
        };
        
        const emailResult = await sendOrderConfirmationEmail(orderForEmail);
        console.log('📧 Email sent:', emailResult.success ? 'Yes' : 'No');
      } catch (emailError) {
        console.error('❌ Email sending failed (async):', emailError.message);
      }
    });

  } catch (error) {
    console.error('❌ Payment verification failed:', error.message);
    
    // Send error response
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment and create order.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      message: 'Please contact support with your payment ID: ' + (req.body.razorpay_payment_id || 'N/A')
    });
  }
});

module.exports = router;
