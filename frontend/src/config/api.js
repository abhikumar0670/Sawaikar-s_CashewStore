// API Configuration for Production and Development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// For production, set REACT_APP_API_URL in Vercel environment variables
// Example: https://your-backend.onrender.com/api

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  ADD_PRODUCT: `${API_BASE_URL}/products/add`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
  ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_SYNC: `${API_BASE_URL}/users/sync`,
  
  // Coupons
  COUPONS: `${API_BASE_URL}/coupons`,
  COUPON_VALIDATE: `${API_BASE_URL}/coupons/validate`,
  COUPON_BY_ID: (id) => `${API_BASE_URL}/coupons/${id}`,
  COUPON_TOGGLE: (id) => `${API_BASE_URL}/coupons/${id}/toggle`,
  
  // Payment
  PAYMENT_CREATE: `${API_BASE_URL}/payment/create-order`,
  PAYMENT_VERIFY: `${API_BASE_URL}/payment/verify`,
  
  // Newsletter
  NEWSLETTER: `${API_BASE_URL}/newsletter`,
};

export default API_BASE_URL;
