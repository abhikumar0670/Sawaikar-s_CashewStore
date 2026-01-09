const User = require('../models/User');

// Admin email list - add your admin emails here
const ADMIN_EMAILS = [
  'abhikumar0670@gmail.com',
  // Add more admin emails as needed
];

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // Check body, query params, and headers for credentials (supports POST, PUT, DELETE, GET)
    const userEmail = req.body.userEmail || req.query.userEmail || req.headers['x-user-email'];
    const clerkId = req.body.clerkId || req.query.clerkId || req.headers['x-clerk-id'];
    
    // Check if email is provided
    if (!userEmail && !clerkId) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'No user credentials provided' 
      });
    }
    
    // Check if email is in admin list
    const email = userEmail || (clerkId ? await getUserEmailFromClerk(clerkId) : null);
    
    if (!email || !ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'Admin privileges required' 
      });
    }
    
    // User is admin, proceed
    req.adminEmail = email;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      error: error.message 
    });
  }
};

// Helper function to get email from Clerk ID
const getUserEmailFromClerk = async (clerkId) => {
  try {
    const user = await User.findOne({ clerkId });
    return user ? user.email : null;
  } catch (error) {
    return null;
  }
};

// Middleware for optional admin check (doesn't block request)
const checkAdmin = async (req, res, next) => {
  try {
    const { userEmail, clerkId } = req.body;
    
    if (userEmail || clerkId) {
      const email = userEmail || (clerkId ? await getUserEmailFromClerk(clerkId) : null);
      req.isAdmin = email && ADMIN_EMAILS.includes(email.toLowerCase());
    } else {
      req.isAdmin = false;
    }
    
    next();
  } catch (error) {
    req.isAdmin = false;
    next();
  }
};

// Function to add admin email programmatically
const addAdminEmail = (email) => {
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    ADMIN_EMAILS.push(email.toLowerCase());
    console.log(`✅ Added admin email: ${email}`);
  }
};

// Function to remove admin email
const removeAdminEmail = (email) => {
  const index = ADMIN_EMAILS.indexOf(email.toLowerCase());
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1);
    console.log(`✅ Removed admin email: ${email}`);
  }
};

// Function to check if email is admin
const isAdminEmail = (email) => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

module.exports = {
  isAdmin,
  checkAdmin,
  addAdminEmail,
  removeAdminEmail,
  isAdminEmail,
  ADMIN_EMAILS
};
