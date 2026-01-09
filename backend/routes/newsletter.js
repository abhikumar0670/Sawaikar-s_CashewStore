const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const { isAdmin } = require('../middleware/auth');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name, source, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      // Reactivate if previously unsubscribed
      if (!subscriber.isActive) {
        subscriber.isActive = true;
        subscriber.unsubscribedAt = null;
        subscriber.subscribedAt = new Date();
        if (name) subscriber.name = name;
        if (preferences) subscriber.preferences = { ...subscriber.preferences, ...preferences };
        await subscriber.save();
        
        console.log(`✅ Newsletter resubscribed: ${email}`);
        return res.json({ 
          success: true, 
          message: 'Welcome back! You have been resubscribed.',
          subscriber 
        });
      }
      
      return res.status(400).json({ 
        message: 'This email is already subscribed to our newsletter' 
      });
    }

    // Create new subscriber
    subscriber = new Newsletter({
      email: email.toLowerCase(),
      name: name || '',
      source: source || 'website',
      preferences: preferences || {}
    });

    await subscriber.save();
    console.log(`✅ New newsletter subscriber: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You\'ll receive our latest updates.',
      subscriber
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    res.status(500).json({ message: 'Error subscribing to newsletter', error: error.message });
  }
});

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;

    let subscriber;
    
    if (token) {
      subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    } else if (email) {
      subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    }

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    console.log(`📧 Newsletter unsubscribed: ${subscriber.email}`);
    res.json({ 
      success: true, 
      message: 'You have been unsubscribed from our newsletter' 
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Error unsubscribing', error: error.message });
  }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get all subscribers (Admin)
// @access  Private (Admin only)
router.get('/subscribers', isAdmin, async (req, res) => {
  try {
    const { active, limit = 100, page = 1 } = req.query;
    
    let query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Newsletter.countDocuments(query);
    const activeCount = await Newsletter.countDocuments({ isActive: true });

    res.json({
      subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
  }
});

// @route   PUT /api/newsletter/:id/preferences
// @desc    Update subscriber preferences
// @access  Public
router.put('/:id/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;

    const subscriber = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { preferences },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.json({ success: true, subscriber });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating preferences', error: error.message });
  }
});

// @route   DELETE /api/newsletter/:id
// @desc    Delete subscriber (Admin)
// @access  Private (Admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    console.log(`🗑️ Newsletter subscriber deleted: ${subscriber.email}`);
    res.json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ message: 'Error deleting subscriber', error: error.message });
  }
});

// @route   GET /api/newsletter/export
// @desc    Export subscribers to CSV (Admin)
// @access  Private (Admin only)
router.get('/export', isAdmin, async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active === 'true') query.isActive = true;

    const subscribers = await Newsletter.find(query).sort({ subscribedAt: -1 });

    // Create CSV content
    const headers = ['Email', 'Name', 'Subscribed At', 'Status', 'Source'];
    const rows = subscribers.map(s => [
      s.email,
      s.name || '',
      s.subscribedAt.toISOString().split('T')[0],
      s.isActive ? 'Active' : 'Inactive',
      s.source
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=newsletter_subscribers.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting subscribers:', error);
    res.status(500).json({ message: 'Error exporting', error: error.message });
  }
});

module.exports = router;
