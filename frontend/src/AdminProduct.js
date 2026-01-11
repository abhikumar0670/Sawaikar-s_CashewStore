import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import { toast } from 'react-toastify';
import { useUser, useClerk } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { FiPackage, FiShoppingCart, FiUsers, FiGrid, FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiUpload, FiStar, FiTruck, FiCheck, FiHome, FiDollarSign, FiTrendingUp, FiCalendar, FiMail, FiEye, FiLogOut, FiBell, FiMenu, FiExternalLink, FiChevronDown, FiChevronRight, FiUser, FiShield, FiSettings, FiActivity, FiTag, FiGift, FiPercent, FiAlertTriangle, FiDownload } from "react-icons/fi";

// API Base URL for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Admin email - change this to your admin email
const ADMIN_EMAIL = "abhikumar0670@gmail.com";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          background: '#FFF8DC',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#8B4513', marginBottom: '1rem' }}>⚠️ Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{this.state.error?.message}</p>
          <a href="/" style={{ 
            padding: '10px 20px', 
            background: '#CD853F', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px' 
          }}>← Back to Store</a>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminProductContent = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userEmailState, setUserEmailState] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: "" });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState(() => {
    // Load notification history from localStorage
    const saved = localStorage.getItem('notificationHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [notificationTab, setNotificationTab] = useState('active'); // 'active' or 'history'
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    // Load dismissed notification IDs from localStorage
    const saved = localStorage.getItem('dismissedNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const hasFetched = useRef(false);
  const hasCheckedAuth = useRef(false);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: "",
    featured: false,
    company: "Sawaikar's",
    stars: 4.5,
    reviews: 0,
    shipping: true,
    variants: [],
    defaultWeight: "250g",
    priceUnit: "per kg"
  });

  // Available weight options for variants
  const weightOptions = ['100g', '250g', '500g', '1kg', '2kg', '5kg'];

  // Check auth only once when loaded
  useEffect(() => {
    if (isLoaded && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      
      let email = "";
      if (user?.primaryEmailAddress?.emailAddress) {
        email = user.primaryEmailAddress.emailAddress;
      } else if (user?.emailAddresses?.[0]?.emailAddress) {
        email = user.emailAddresses[0].emailAddress;
      }
      
      const adminStatus = isSignedIn && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setUserEmailState(email);
      setIsAdminUser(adminStatus);
      setAuthChecked(true);
    }
    
    // Fallback timeout - if Clerk takes too long, show access denied
    const timeout = setTimeout(() => {
      if (!hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        setAuthChecked(true);
        setIsAdminUser(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, user]);

  // Fetch products only once after auth is confirmed
  useEffect(() => {
    if (authChecked && isAdminUser && !hasFetched.current) {
      hasFetched.current = true;
      
      // Fetch products
      axios.get(`${API_URL}/products")
        .then(response => {
          setProducts(response.data);
          setFilteredProducts(response.data);
        })
        .catch(error => {
          console.error("Error fetching products:", error);
          setMessage({ type: "error", text: "Failed to fetch products" });
        });

      // Fetch orders
      axios.get(`${API_URL}/orders")
        .then(response => {
          // Handle both array and object response formats
          const ordersData = Array.isArray(response.data) ? response.data : (response.data.orders || []);
          setOrders(ordersData);
        })
        .catch(error => {
          console.error("Error fetching orders:", error);
          setOrders([]);
        });

      // Fetch customers
      axios.get(`${API_URL}/users")
        .then(response => {
          // API returns { success: true, users: [...] }
          const usersData = Array.isArray(response.data) ? response.data : (response.data.users || []);
          setCustomers(usersData);
        })
        .catch(error => {
          console.error("Error fetching customers:", error);
          setCustomers([]);
        });

      // Fetch coupons
      axios.get(`${API_URL}/coupons")
        .then(response => {
          setCoupons(response.data);
        })
        .catch(error => {
          console.error("Error fetching coupons:", error);
          setCoupons([]);
        });
    }
  }, [authChecked, isAdminUser]);

  // Calculate dashboard stats
  useEffect(() => {
    const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);
    setDashboardStats({
      totalSales,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length
    });
  }, [orders, customers, products]);

  // Helper function to get time ago string
  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Generate notifications based on data
  useEffect(() => {
    const newNotifications = [];
    const now = new Date();
    
    // Low stock notifications - individual products
    const lowStockProducts = products.filter(p => p.stock < 10);
    lowStockProducts.forEach((product, index) => {
      newNotifications.push({
        id: `low-stock-${product.id}-${index}`,
        type: 'warning',
        icon: '⚠️',
        title: 'Low Stock Alert',
        message: `"${product.name}" has only ${product.stock} items left`,
        time: 'Just now',
        timestamp: now
      });
    });
    
    // Recent orders notifications - show each order
    const recentOrders = orders.slice(0, 5); // Show last 5 orders
    recentOrders.forEach((order, index) => {
      const customerName = order.userName || order.customerName || order.shippingAddress?.name || order.user?.name || 'A customer';
      const orderAmount = order.totalAmount || order.totalPrice || order.total || 0;
      const orderDate = order.createdAt ? new Date(order.createdAt) : now;
      
      newNotifications.push({
        id: `order-${order._id || order.id}-${index}`,
        type: 'info',
        icon: '🛍️',
        title: 'New Order Received',
        message: `${customerName} placed an order for ₹${orderAmount.toLocaleString()}`,
        time: getTimeAgo(orderDate),
        timestamp: orderDate
      });
    });
    
    // Recent customer registrations
    const recentCustomers = customers.slice(0, 3); // Show last 3 customers
    recentCustomers.forEach((customer, index) => {
      const customerDate = customer.createdAt ? new Date(customer.createdAt) : now;
      newNotifications.push({
        id: `customer-${customer._id || customer.id}-${index}`,
        type: 'success',
        icon: '👤',
        title: 'New User Registered',
        message: `${customer.name || customer.email || 'New user'} signed up`,
        time: getTimeAgo(customerDate),
        timestamp: customerDate
      });
    });

    // Pending orders alert
    const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending');
    if (pendingOrders.length > 0) {
      newNotifications.push({
        id: `pending-alert-${Date.now()}`,
        type: 'warning',
        icon: '⏳',
        title: 'Orders Pending',
        message: `${pendingOrders.length} order(s) need your attention`,
        time: 'Action needed',
        timestamp: now
      });
    }

    // Sort by timestamp (newest first)
    newNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Filter out dismissed notifications
    const filteredNotifications = newNotifications.filter(n => !dismissedNotifIds.includes(n.id));
    setNotifications(filteredNotifications);
  }, [products, orders, customers, dismissedNotifIds]);

  // Mark notification as read - moves to history and persists
  const markAsRead = (notifId) => {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
      // Add to history
      const newHistoryItem = {
        ...notif,
        readAt: new Date().toLocaleString()
      };
      const updatedHistory = [newHistoryItem, ...notificationHistory];
      setNotificationHistory(updatedHistory);
      localStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
      
      // Remove from active
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      
      // Persist to localStorage so it doesn't come back after refresh
      const updatedDismissed = [...dismissedNotifIds, notifId];
      setDismissedNotifIds(updatedDismissed);
      localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
    }
  };

  // Delete notification permanently
  const deleteNotification = (notifId, isHistory = false) => {
    if (isHistory) {
      const updatedHistory = notificationHistory.filter(n => n.id !== notifId);
      setNotificationHistory(updatedHistory);
      localStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
    } else {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      // Also add to dismissed so it doesn't come back
      const updatedDismissed = [...dismissedNotifIds, notifId];
      setDismissedNotifIds(updatedDismissed);
      localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const readNotifs = notifications.map(n => ({
      ...n,
      readAt: new Date().toLocaleString()
    }));
    const updatedHistory = [...readNotifs, ...notificationHistory];
    setNotificationHistory(updatedHistory);
    localStorage.setItem('notificationHistory', JSON.stringify(updatedHistory));
    
    // Persist all IDs to localStorage
    const allIds = notifications.map(n => n.id);
    const updatedDismissed = [...dismissedNotifIds, ...allIds];
    setDismissedNotifIds(updatedDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(updatedDismissed));
    setNotifications([]);
  };

  // Clear all history
  const clearHistory = () => {
    setNotificationHistory([]);
    localStorage.setItem('notificationHistory', JSON.stringify([]));
  };

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Refresh products (for after add/edit/delete)
  const refreshProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  }, []);

  // Refresh orders
  const refreshOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/orders");
      setOrders(response.data.orders || response.data || []);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      await axios.put(`${API_URL}/orders/${orderId}/status`, {
        orderStatus: newStatus,
        userEmail: userEmail
      });
      // Refresh orders to get updated data
      refreshOrders();
      setMessage({ type: "success", text: `Order status updated to ${newStatus}` });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error updating order status:", error);
      setMessage({ type: "error", text: "Failed to update order status" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Generate product ID from name
  const generateProductId = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      price: "",
      category: "",
      stock: "",
      description: "",
      image: "",
      featured: false,
      company: "Sawaikar's",
      stars: 4.5,
      reviews: 0,
      shipping: true,
      variants: [],
      defaultWeight: "250g",
      priceUnit: "per kg"
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  // Handle form submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        setMessage({ type: "error", text: "Please fill in all required fields" });
        setSaving(false);
        return;
      }

      // Validate price
      const parsedPrice = parseFloat(formData.price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setMessage({ type: "error", text: "Price must be a positive number" });
        setSaving(false);
        return;
      }

      // Convert price from rupees to paise (₹1680 → 168000 paise)
      // This ensures consistency with the database which stores prices in paise
      const priceInPaise = Math.round(parsedPrice * 100);

      // Validate stock
      const parsedStock = formData.stock ? parseInt(formData.stock) : 0;
      if (isNaN(parsedStock) || parsedStock < 0) {
        setMessage({ type: "error", text: "Stock must be a non-negative number" });
        setSaving(false);
        return;
      }

      // Split and clean image URLs (crucial for comma-separated links)
      const imageUrls = formData.image
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        price: priceInPaise,
        stock: parsedStock,
        category: formData.category,
        rating: formData.stars ? parseFloat(formData.stars) : 0,
        description: formData.description || `Premium quality ${formData.name} from Sawaikar's Cashew Store.`,
        images: imageUrls,
        featured: formData.featured,
        shipping: formData.shipping,
        variants: formData.variants ? formData.variants.map(v => ({
          weight: v.weight,
          price: Math.round(parseFloat(v.price) * 100), // Convert to paise
          stock: parseInt(v.stock) || 0,
          sku: v.sku || ''
        })) : [],
        defaultWeight: formData.defaultWeight || '250g',
        priceUnit: formData.priceUnit || 'per kg',
        userEmail: userEmailState // Include user email for admin authentication
      };

      if (editingProduct) {
        // Update existing product - use schema field names
        const updateData = {
          id: editingProduct.id,
          name: formData.name.trim(),
          price: priceInPaise,
          stock: parsedStock,
          category: formData.category,
          rating: formData.stars ? parseFloat(formData.stars) : 0,
          description: formData.description || `Premium quality ${formData.name} from Sawaikar's Cashew Store.`,
          image: imageUrls,
          featured: formData.featured,
          shipping: formData.shipping,
          company: formData.company || "Sawaikar's",
          variants: formData.variants ? formData.variants.map(v => ({
            weight: v.weight,
            price: Math.round(parseFloat(v.price) * 100), // Convert to paise
            stock: parseInt(v.stock) || 0,
            sku: v.sku || ''
          })) : [],
          defaultWeight: formData.defaultWeight || '250g',
          priceUnit: formData.priceUnit || 'per kg',
          userEmail: userEmailState // Include user email for admin authentication
        };
        
        console.log('📤 Updating product:', updateData);
        
        const response = await axios.put(
          `${API_URL}/products/${editingProduct.id}`,
          updateData
        );
        
        console.log('✅ Product updated:', response.data);
        
        setMessage({ type: "success", text: "✅ Product updated successfully!" });
        
        // Show success toast
        toast.success("Product updated successfully! 🎉", {
          position: "top-center",
          autoClose: 3000
        });
      } else {
        // Add new product using dedicated /add route
        console.log('📤 Sending product data:', productData);
        
        const response = await axios.post(
          `${API_URL}/products/add",
          productData
        );
        
        console.log('✅ Product added:', response.data);
        
        setMessage({ type: "success", text: "✅ Product added successfully!" });
        
        // Show success toast
        toast.success("Product added successfully! 🎉", {
          position: "top-center",
          autoClose: 3000
        });
      }

      // Close modal after short delay
      setTimeout(() => {
        resetForm();
        setShowModal(false);
      }, 1500);
      
      // Refresh product list immediately
      refreshProducts();
      
    } catch (error) {
      console.error("❌ Error saving product:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save product";
      
      setMessage({
        type: "error",
        text: `❌ ${errorMessage}`,
      });
      
      // Show error toast
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle edit button click
  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      price: (product.price / 100).toString(), // Convert paise to rupees for display
      category: product.category,
      stock: product.stock.toString(),
      description: product.description || "",
      image: Array.isArray(product.image) ? product.image.join(", ") : product.image,
      featured: product.featured || false,
      company: product.company || "Sawaikar's",
      stars: product.stars || 4.5,
      reviews: product.reviews || 0,
      shipping: product.shipping !== false,
      variants: product.variants ? product.variants.map(v => ({
        ...v,
        price: (v.price / 100).toString() // Convert paise to rupees for display
      })) : [],
      defaultWeight: product.defaultWeight || '250g',
      priceUnit: product.priceUnit || 'per kg'
    });
    setMessage({ type: "", text: "" });
    setShowModal(true);
  }, []);

  // Handle delete button click - Open confirmation modal
  const handleDelete = useCallback((productId, productName) => {
    setDeleteModal({ isOpen: true, productId, productName });
  }, []);

  // Close delete modal
  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, productId: null, productName: "" });
  }, []);

  // Confirm delete - Actual deletion logic
  const confirmDelete = useCallback(async () => {
    const { productId, productName } = deleteModal;
    
    try {
      await axios.delete(`${API_URL}/products/${productId}?userEmail=${encodeURIComponent(userEmailState)}`);
      
      // Close modal
      closeDeleteModal();
      
      // Show success toast
      toast.success(`${productName} has been deleted successfully! 🗑️`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh product list
      refreshProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      
      // Show error toast
      toast.error(error.response?.data?.message || "Failed to delete product", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  }, [deleteModal, closeDeleteModal, refreshProducts]);

  // Open Add Product Modal
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Get stock badge
  const getStockBadge = (stock) => {
    if (stock > 20) {
      return <StockBadge className="in-stock">🔥 Freshly Roasted ({stock})</StockBadge>;
    } else if (stock >= 10) {
      return <StockBadge className="low-stock">📦 Packaging ({stock})</StockBadge>;
    } else {
      return <StockBadge className="out-stock">🚚 Ready to Ship ({stock})</StockBadge>;
    }
  };

  // Format price - handles both paise and rupees for backward compatibility
  const formatPrice = (price) => {
    if (!price || price === 0) return '₹0.00';
    
    // If price is very small (< 1000), it's likely already in rupees (old orders)
    // If price is large (>= 1000), it's in paise (correct format)
    const priceInRupees = price >= 1000 ? price / 100 : price;
    
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(priceInRupees);
  };

  // Helper to convert price to rupees (handles both paise and already-converted)
  const toRupees = (price) => {
    if (!price || price === 0) return 0;
    return price >= 1000 ? price / 100 : price;
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      roasted: "🔥 Roasted",
      salted: "🧂 Salted",
      flavored: "🌶️ Flavored",
      cashews: "🥜 Plain",
      "gift-packs": "🎁 Gift Pack",
      combo: "📦 Combo",
      other: "📋 Other",
    };
    return categories[category] || category;
  };

  // ========== CSV EXPORT FUNCTIONS ==========
  
  // Export orders to CSV
  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders to export!');
      return;
    }

    // Define CSV headers
    const headers = [
      'Order ID',
      'Customer Name',
      'Email',
      'Phone',
      'Items',
      'Quantity',
      'Total Amount (₹)',
      'Payment Status',
      'Order Status',
      'Order Date',
      'Shipping Address'
    ];

    // Convert orders to CSV rows
    const csvRows = orders.map(order => {
      const items = order.items?.map(item => `${item.name} (x${item.quantity})`).join('; ') || 'N/A';
      const totalQty = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
      const rawAmount = order.totalAmount || order.totalPrice || order.total || 0;
      const amount = (rawAmount >= 1000 ? rawAmount / 100 : rawAmount).toFixed(2);
      const address = order.shippingAddress ? 
        `${order.shippingAddress.address || ''} ${order.shippingAddress.city || ''} ${order.shippingAddress.state || ''} ${order.shippingAddress.pincode || ''}`.trim() : 
        'N/A';
      
      return [
        order.orderId || (order._id || order.id)?.slice(-8).toUpperCase(),
        order.userName || order.customerName || order.shippingAddress?.name || 'Guest',
        order.userEmail || order.email || 'N/A',
        order.userPhone || 'N/A',
        `"${items}"`,
        totalQty,
        amount,
        order.paymentStatus || order.paymentInfo?.status || 'Pending',
        order.status || 'Pending',
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
        `"${address}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sawaikars_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${orders.length} orders to CSV!`);
  };

  // Export products to CSV
  const exportProductsToCSV = () => {
    if (products.length === 0) {
      toast.error('No products to export!');
      return;
    }

    const headers = [
      'Product ID',
      'Name',
      'Price (₹)',
      'Stock',
      'Category',
      'Rating',
      'Featured',
      'Description'
    ];

    const csvRows = products.map(product => [
      product.id,
      `"${product.name}"`,
      (product.price / 100).toFixed(2),
      product.stock,
      product.category,
      product.rating || 0,
      product.featured ? 'Yes' : 'No',
      `"${(product.description || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sawaikars_products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${products.length} products to CSV!`);
  };

  // ========== LOW STOCK ALERT FUNCTIONS ==========
  
  // Get products with low stock
  const getLowStockProducts = () => {
    return products.filter(p => p.stock < lowStockThreshold).sort((a, b) => a.stock - b.stock);
  };

  // Quick stock update function
  const handleQuickStockUpdate = async (productId, newStock) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      await axios.put(`${API_URL}/products/${productId}`, {
        ...product,
        stock: parseInt(newStock)
      });
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: parseInt(newStock) } : p
      ));
      
      // Add notification for stock replenishment
      if (parseInt(newStock) >= lowStockThreshold) {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'success',
          title: 'Stock Replenished',
          message: `${product.name} stock updated to ${newStock} units`,
          time: 'Just now',
          read: false
        }, ...prev]);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock. Please try again.');
    }
  };

  // Generate low stock notifications
  useEffect(() => {
    const lowStockProducts = getLowStockProducts();
    
    // Create notifications for low stock items
    const lowStockNotifications = lowStockProducts.map(product => ({
      id: `low-stock-${product.id}`,
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${product.name} has only ${product.stock} units left`,
      time: 'Stock Alert',
      read: false,
      productId: product.id,
      stock: product.stock
    }));
    
    // Merge with existing notifications (avoid duplicates)
    setNotifications(prev => {
      const existingIds = prev.map(n => n.id);
      const newNotifications = lowStockNotifications.filter(n => !existingIds.includes(n.id));
      // Update existing low stock notifications with current stock values
      const updatedPrev = prev.map(n => {
        const matching = lowStockNotifications.find(ln => ln.id === n.id);
        return matching ? { ...n, message: matching.message, stock: matching.stock } : n;
      });
      // Remove notifications for products no longer low on stock
      const filteredPrev = updatedPrev.filter(n => {
        if (n.id.toString().startsWith('low-stock-')) {
          return lowStockProducts.some(p => `low-stock-${p.id}` === n.id);
        }
        return true;
      });
      return [...newNotifications, ...filteredPrev];
    });
  }, [products, lowStockThreshold]);

  // ========== COUPON MANAGEMENT FUNCTIONS ==========
  
  // Handle coupon form submission
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const couponData = {
        ...formData,
        createdBy: userEmailState
      };
      
      if (editingCoupon) {
        await axios.put(`${API_URL}/coupons/${editingCoupon._id}`, couponData);
        toast.success("Coupon updated successfully! 🎉");
      } else {
        await axios.post(`${API_URL}/coupons`, couponData);
        toast.success("Coupon created successfully! 🎉");
      }
      
      // Refresh coupons
      const response = await axios.get(`${API_URL}/coupons`);
      setCoupons(response.data);
      
      setShowCouponModal(false);
      setEditingCoupon(null);
      resetForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };
  
  // Delete coupon
  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      await axios.delete(`${API_URL}/coupons/${couponId}`);
      toast.success("Coupon deleted successfully!");
      
      // Refresh coupons
      const response = await axios.get(`${API_URL}/coupons");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };
  
  // Toggle coupon active status
  const handleToggleCoupon = async (couponId) => {
    try {
      await axios.patch(`${API_URL}/coupons/${couponId}/toggle`);
      toast.success("Coupon status updated!");
      
      // Refresh coupons
      const response = await axios.get(`${API_URL}/coupons");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error toggling coupon:", error);
      toast.error("Failed to update coupon status");
    }
  };
  
  // Open coupon modal for editing
  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount || '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive
    });
    setShowCouponModal(true);
  };

  // Show loading while checking auth
  if (!authChecked) {
    console.log('AdminProduct: Waiting for auth check...');
    return (
      <DashboardWrapper style={{ background: '#FFF8DC' }}>
        <LoadingScreen style={{ background: '#FFF8DC', color: '#333' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '4px solid #ddd', borderTopColor: '#CD853F', borderRadius: '50%' }}></div>
          <p style={{ color: '#333' }}>Loading Admin Dashboard...</p>
        </LoadingScreen>
      </DashboardWrapper>
    );
  }

  // Access denied for non-admin users
  if (!isAdminUser) {
    console.log('AdminProduct: Access denied. Email:', userEmailState, 'Admin email:', ADMIN_EMAIL);
    return (
      <DashboardWrapper style={{ background: '#FFF8DC' }}>
        <AccessDenied style={{ background: '#FFF8DC' }}>
          <div className="icon">🚫</div>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p>Only administrators can manage products.</p>
          {userEmailState && <p className="email">Logged in as: <strong>{userEmailState}</strong></p>}
          <p className="required">Admin email required: <strong>{ADMIN_EMAIL}</strong></p>
          <Link to="/" style={{ marginTop: '20px', padding: '10px 20px', background: '#CD853F', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>← Back to Store</Link>
        </AccessDenied>
      </DashboardWrapper>
    );
  }

  console.log('AdminProduct: Rendering admin dashboard for:', userEmailState);

  return (
    <DashboardWrapper>
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <div className="logo">
            <span className="logo-icon">🥜</span>
            <div className="logo-text">
              <h3>Sawaikar's</h3>
              <span>Admin Panel</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarNav>
          <NavItem 
            className={activeNav === "dashboard" ? "active" : ""} 
            onClick={() => setActiveNav("dashboard")}
          >
            <FiGrid /> Dashboard
          </NavItem>
          <NavItem 
            className={activeNav === "inventory" ? "active" : ""} 
            onClick={() => setActiveNav("inventory")}
          >
            <FiPackage /> Godown Stock
          </NavItem>
          <NavItem 
            className={activeNav === "orders" ? "active" : ""} 
            onClick={() => setActiveNav("orders")}
          >
            <FiShoppingCart /> Orders
          </NavItem>
          <NavItem 
            className={activeNav === "customers" ? "active" : ""} 
            onClick={() => setActiveNav("customers")}
          >
            <FiUsers /> Customers
          </NavItem>
          <NavItem 
            className={activeNav === "coupons" ? "active" : ""} 
            onClick={() => setActiveNav("coupons")}
          >
            <FiTag /> Coupons
          </NavItem>
          <NavItem 
            className={activeNav === "analytics" ? "active" : ""} 
            onClick={() => setActiveNav("analytics")}
          >
            <FiTrendingUp /> Analytics
          </NavItem>

          <SidebarDivider />

          <BackToStoreLink to="/">
            <FiHome /> Back to Store
          </BackToStoreLink>
        </SidebarNav>

        <SidebarFooter>
          <div className="admin-info">
            <div className="avatar">
              <img src="/images/admin-profile.jpg" alt="Admin" />
            </div>
            <div className="info">
              <span className="name">Abhishek Kumar</span>
              <span className="email">{userEmailState}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        {/* Top Bar */}
        <TopBar>
          {/* Left Section: Hamburger + Brand + Breadcrumbs */}
          <div className="left-section">
            <button className="hamburger-btn" onClick={() => console.log('Toggle sidebar')}>
              <FiMenu />
            </button>
            <div className="brand">
              <span className="brand-icon">🥜</span>
              <span className="brand-text">Sawaikar's Admin</span>
            </div>
            <Breadcrumbs>
              <span className="breadcrumb">Dashboard</span>
              <FiChevronRight className="separator" />
              <span className="breadcrumb active">
                {activeNav === 'dashboard' ? 'Overview' : 
                 activeNav === 'inventory' ? 'Godown Stock' : 
                 activeNav === 'orders' ? 'Orders' : 
                 activeNav === 'customers' ? 'Customers' : 'Dashboard'}
              </span>
            </Breadcrumbs>
          </div>

          {/* Center Section: Global Search */}
          <SearchContainer>
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search orders, products, or customers... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <FiX />
              </button>
            )}
          </SearchContainer>

          {/* Right Section: Greeting + Actions + Notifications + Profile */}
          <div className="right-section">
            <WelcomeGreeting>
              <span className="greeting-text">Welcome back, Admin</span>
              <FiUser className="greeting-icon" />
            </WelcomeGreeting>

            <QuickAction as={Link} to="/" target="_blank" title="Visit Store">
              <FiExternalLink />
              <span>Visit Store</span>
            </QuickAction>

            <NotificationWrapper ref={notificationRef}>
              <NotificationButton onClick={() => setShowNotifications(!showNotifications)}>
                <FiBell />
                {notifications.length > 0 && <span className="dot"></span>}
              </NotificationButton>
              
              {showNotifications && (
                <NotificationDropdown>
                  <div className="dropdown-header">
                    <h4>🔔 Notifications</h4>
                    <span className="count">{notificationTab === 'active' ? notifications.length : notificationHistory.length}</span>
                  </div>
                  
                  {/* Tabs */}
                  <div className="dropdown-tabs">
                    <button 
                      className={notificationTab === 'active' ? 'active' : ''} 
                      onClick={() => setNotificationTab('active')}
                    >
                      Active ({notifications.length})
                    </button>
                    <button 
                      className={notificationTab === 'history' ? 'active' : ''} 
                      onClick={() => setNotificationTab('history')}
                    >
                      📜 History ({notificationHistory.length})
                    </button>
                  </div>

                  <div className="dropdown-body">
                    {notificationTab === 'active' ? (
                      <>
                        {notifications.length === 0 ? (
                          <div className="empty-notifications">
                            <span>✅</span>
                            <p>All caught up!</p>
                          </div>
                        ) : (
                          <>
                            {notifications.map((notif) => (
                              <div key={notif.id} className={`notification-item ${notif.type}`}>
                                <span className="notif-icon">{notif.icon}</span>
                                <div className="notif-content">
                                  <strong>{notif.title}</strong>
                                  <p>{notif.message}</p>
                                  <span className="notif-time">{notif.time}</span>
                                </div>
                                <div className="notif-actions">
                                  <button className="mark-read" onClick={() => markAsRead(notif.id)} title="Mark as Read">
                                    ✓
                                  </button>
                                  <button className="delete" onClick={() => deleteNotification(notif.id)} title="Delete">
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {notificationHistory.length === 0 ? (
                          <div className="empty-notifications">
                            <span>📭</span>
                            <p>No history yet</p>
                          </div>
                        ) : (
                          <>
                            {notificationHistory.map((notif) => (
                              <div key={notif.id} className={`notification-item ${notif.type} read`}>
                                <span className="notif-icon">{notif.icon}</span>
                                <div className="notif-content">
                                  <strong>{notif.title}</strong>
                                  <p>{notif.message}</p>
                                  <span className="notif-time">Read: {notif.readAt}</span>
                                </div>
                                <div className="notif-actions">
                                  <button className="delete" onClick={() => deleteNotification(notif.id, true)} title="Delete">
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="dropdown-footer">
                    {notificationTab === 'active' && notifications.length > 0 && (
                      <button className="mark-all" onClick={markAllAsRead}>Mark All as Read</button>
                    )}
                    {notificationTab === 'history' && notificationHistory.length > 0 && (
                      <button className="clear-all" onClick={clearHistory}>Clear History</button>
                    )}
                    <button onClick={() => setShowNotifications(false)}>Close</button>
                  </div>
                </NotificationDropdown>
              )}
            </NotificationWrapper>

            <ProfileMenu ref={profileRef}>
              <ProfileButton onClick={() => setShowProfileMenu(!showProfileMenu)} $isOpen={showProfileMenu}>
                <div className="avatar">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Admin" />
                  ) : (
                    'AK'
                  )}
                </div>
                <div className="user-info">
                  <span className="name">Abhishek Kumar</span>
                  <span className="role">Super Admin</span>
                </div>
                <FiChevronDown className="chevron" />
              </ProfileButton>
              {showProfileMenu && (
                <ProfileDropdown>
                  <div className="profile-header">
                    <div className="avatar">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="Admin" />
                      ) : (
                        'AK'
                      )}
                    </div>
                    <div className="user-details">
                      <div className="name">Abhishek Kumar</div>
                      <div className="email">{userEmailState}</div>
                    </div>
                  </div>
                  <div className="menu-divider"></div>
                  <button className="menu-item" onClick={() => { setActiveNav('profile'); setShowProfileMenu(false); }}>
                    <FiEye /> View Profile
                  </button>
                  <div className="menu-divider"></div>
                  <button className="menu-item danger" onClick={() => { signOut(); navigate('/'); }}>
                    <FiLogOut /> Sign Out
                  </button>
                </ProfileDropdown>
              )}
            </ProfileMenu>
          </div>
        </TopBar>

        {/* Stats Header */}
        <StatsHeader>
          <StatCard className="products">
            <div className="stat-icon"><FiPackage /></div>
            <div className="stat-info">
              <span className="stat-value">{products.length}</span>
              <span className="stat-label">Total Products</span>
            </div>
          </StatCard>
          <StatCard className="low-stock">
            <div className="stat-icon warning"><FiTrendingUp /></div>
            <div className="stat-info">
              <span className="stat-value">{products.filter(p => p.stock < 10).length}</span>
              <span className="stat-label">Low Stock</span>
            </div>
          </StatCard>
          <StatCard className="featured">
            <div className="stat-icon success"><FiStar /></div>
            <div className="stat-info">
              <span className="stat-value">{products.filter(p => p.featured).length}</span>
              <span className="stat-label">Featured</span>
            </div>
          </StatCard>
          <StatCard className="orders">
            <div className="stat-icon info"><FiShoppingCart /></div>
            <div className="stat-info">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </StatCard>
        </StatsHeader>

        {/* Content Wrapper */}
        <ContentWrapper>
          {/* Message Display */}
          {message.text && (
            <Message className={message.type}>
              {message.type === "success" ? <FiCheck /> : <FiX />}
              {message.text}
              <button onClick={() => setMessage({ type: "", text: "" })}>
                <FiX />
              </button>
            </Message>
          )}

          {/* Dashboard View */}
          {activeNav === "dashboard" && (
            <ContentSection>
              <SectionHeader>
                <div className="title-area">
                  <FiGrid className="section-icon" />
                  <div>
                    <h2>Dashboard Overview</h2>
                    <p>Quick summary of your store's performance</p>
                  </div>
                </div>
              </SectionHeader>

              <DashboardGrid>
                <DashboardCard className="sales">
                  <div className="card-icon">
                    <FiDollarSign />
                  </div>
                  <div className="card-content">
                    <h3>Total Sales</h3>
                  <span className="value">{formatPrice(dashboardStats.totalSales)}</span>
                  <span className="label">All time revenue</span>
                </div>
              </DashboardCard>

              <DashboardCard className="orders">
                <div className="card-icon">
                  <FiShoppingCart />
                </div>
                <div className="card-content">
                  <h3>Total Orders</h3>
                  <span className="value">{dashboardStats.totalOrders}</span>
                  <span className="label">Orders received</span>
                </div>
              </DashboardCard>

              <DashboardCard className="customers">
                <div className="card-icon">
                  <FiUsers />
                </div>
                <div className="card-content">
                  <h3>Total Customers</h3>
                  <span className="value">{dashboardStats.totalCustomers}</span>
                  <span className="label">Registered users</span>
                </div>
              </DashboardCard>

              <DashboardCard className="products">
                <div className="card-icon">
                  <FiPackage />
                </div>
                <div className="card-content">
                  <h3>Total Products</h3>
                  <span className="value">{dashboardStats.totalProducts}</span>
                  <span className="label">In inventory</span>
                </div>
              </DashboardCard>
            </DashboardGrid>

            {/* Recent Activity */}
            <RecentSection>
              <h3><FiPackage style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Godown Overview</h3>
              <QuickStatsGrid>
                <QuickStatItem className="need-roasting">
                  <span className="icon-wrapper"><FiAlertTriangle /></span>
                  <div>
                    <strong>{products.filter(p => p.stock < 10).length}</strong>
                    <span>Need Roasting</span>
                  </div>
                </QuickStatItem>
                <QuickStatItem className="premium">
                  <span className="icon-wrapper"><FiStar /></span>
                  <div>
                    <strong>{products.filter(p => p.featured).length}</strong>
                    <span>Premium Selection</span>
                  </div>
                </QuickStatItem>
                <QuickStatItem className="awaiting">
                  <span className="icon-wrapper"><FiShoppingCart /></span>
                  <div>
                    <strong>{orders.filter(o => o.status === 'Pending' || o.status === 'pending').length}</strong>
                    <span>Awaiting Dispatch</span>
                  </div>
                </QuickStatItem>
                <QuickStatItem className="delivered">
                  <span className="icon-wrapper"><FiTruck /></span>
                  <div>
                    <strong>{orders.filter(o => o.status === 'Delivered' || o.status === 'delivered').length}</strong>
                    <span>Delivered Fresh</span>
                  </div>
                </QuickStatItem>
              </QuickStatsGrid>
            </RecentSection>

            {/* Low Stock Alerts Section */}
            {getLowStockProducts().length > 0 && (
              <RecentSection style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3><FiAlertTriangle style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#D97706' }} /> Low Stock Alerts ({getLowStockProducts().length})</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      Threshold:
                      <select 
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                      >
                        <option value={5}>5 units</option>
                        <option value={10}>10 units</option>
                        <option value={15}>15 units</option>
                        <option value={20}>20 units</option>
                        <option value={25}>25 units</option>
                      </select>
                    </label>
                    <AddButton 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => setShowLowStockModal(true)}
                    >
                      <FiPlus /> Quick Restock
                    </AddButton>
                  </div>
                </div>
                <TableContainer style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <ProductTable>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Current Stock</th>
                        <th>Status</th>
                        <th>Quick Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLowStockProducts().slice(0, 5).map(product => (
                        <tr key={product.id}>
                          <td>
                            <ProductInfo>
                              <span className="name">{product.name}</span>
                              <span className="id">ID: {product.id}</span>
                            </ProductInfo>
                          </td>
                          <td>
                            <span style={{ 
                              fontWeight: 'bold', 
                              color: product.stock <= 3 ? '#e74c3c' : product.stock <= 5 ? '#f39c12' : '#27ae60',
                              fontSize: '1.1rem'
                            }}>
                              {product.stock} units
                            </span>
                          </td>
                          <td>
                            {product.stock === 0 ? (
                              <span style={{ background: '#e74c3c', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                Out of Stock
                              </span>
                            ) : product.stock <= 3 ? (
                              <span style={{ background: '#f39c12', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                Critical
                              </span>
                            ) : (
                              <span style={{ background: '#3498db', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                Low Stock
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input
                                type="number"
                                min="0"
                                placeholder="New qty"
                                id={`stock-${product.id}`}
                                style={{ 
                                  width: '80px', 
                                  padding: '0.4rem', 
                                  borderRadius: '6px', 
                                  border: '1px solid #ddd',
                                  textAlign: 'center'
                                }}
                              />
                              <IconButton
                                className="edit"
                                onClick={() => {
                                  const input = document.getElementById(`stock-${product.id}`);
                                  if (input && input.value) {
                                    handleQuickStockUpdate(product.id, input.value);
                                    input.value = '';
                                  }
                                }}
                                title="Update Stock"
                              >
                                <FiCheck />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ProductTable>
                  {getLowStockProducts().length > 5 && (
                    <p style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                      And {getLowStockProducts().length - 5} more products need restocking...
                      <span 
                        style={{ color: '#8B4513', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
                        onClick={() => setActiveNav('inventory')}
                      >
                        View All in Inventory
                      </span>
                    </p>
                  )}
                </TableContainer>
              </RecentSection>
            )}
          </ContentSection>
        )}

        {/* Inventory Section */}
        {activeNav === "inventory" && (
        <ContentSection>
          <SectionHeader>
            <div className="title-area">
              <FiPackage className="section-icon" />
              <div>
                <h2>Godown Stock Management</h2>
                <p>Manage your roasting batches, harvest records, and pricing</p>
              </div>
            </div>
          </SectionHeader>

          {/* Action Bar */}
          <ActionBar>
            <SearchBox>
              <FiSearch />
              <input
                type="text"
                placeholder="Search by Batch ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm("")}>
                  <FiX />
                </button>
              )}
            </SearchBox>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <AddButton onClick={exportProductsToCSV} style={{ background: '#27ae60' }}>
                <FiDownload /> Export CSV
              </AddButton>
              <AddButton onClick={openAddModal}>
                <FiPlus /> Register New Harvest
              </AddButton>
            </div>
          </ActionBar>

          {/* Products Table */}
          <TableContainer>
            {filteredProducts.length === 0 ? (
              <EmptyState>
                <FiPackage />
                <h3>No products found</h3>
                <p>{searchTerm ? "Try a different search term" : "Add your first product to get started"}</p>
              </EmptyState>
            ) : (
              <ProductTable>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <ProductThumbnail>
                          <img
                            src={Array.isArray(product.image) ? product.image[0] : product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "./images/premium.jpg";
                            }}
                          />
                        </ProductThumbnail>
                      </td>
                      <td>
                        <ProductInfo>
                          <span className="name">{product.name}</span>
                          <span className="id">ID: {product.id}</span>
                          {product.featured && <span className="featured-badge">⭐ Featured</span>}
                        </ProductInfo>
                      </td>
                      <td>
                        <PriceDisplay>{formatPrice(product.price)}</PriceDisplay>
                      </td>
                      <td>{getStockBadge(product.stock)}</td>
                      <td>
                        <CategoryBadge>{getCategoryLabel(product.category)}</CategoryBadge>
                      </td>
                      <td>
                        <ActionButtons>
                          <IconButton className="edit" onClick={() => handleEdit(product)} title="Edit">
                            <FiEdit2 />
                          </IconButton>
                          <IconButton 
                            className="delete" 
                            onClick={() => handleDelete(product.id, product.name)} 
                            title="Delete"
                          >
                            <FiTrash2 />
                          </IconButton>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ProductTable>
            )}
          </TableContainer>
        </ContentSection>
        )}

        {/* Orders Section */}
        {activeNav === "orders" && (
          <ContentSection>
            <SectionHeader>
              <div className="title-area">
                <FiShoppingCart className="section-icon" />
                <div>
                  <h2>Order Management</h2>
                  <p>View and manage customer orders</p>
                </div>
              </div>
              <AddButton onClick={exportOrdersToCSV} style={{ background: '#27ae60' }}>
                <FiDownload /> Export to CSV
              </AddButton>
            </SectionHeader>

            <TableContainer>
              {orders.length === 0 ? (
                <EmptyState>
                  <FiShoppingCart />
                  <h3>No orders yet</h3>
                  <p>Orders will appear here when customers make purchases</p>
                </EmptyState>
              ) : (
                <ProductTable>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Payment</th>
                      <th>Order Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id || order.id}>
                        <td>
                          <ProductInfo>
                            <span className="id">#{order.orderId || (order._id || order.id)?.slice(-8).toUpperCase()}</span>
                          </ProductInfo>
                        </td>
                        <td>
                          <ProductInfo>
                            <span className="name">{order.userName || order.customerName || order.shippingAddress?.name || order.user?.name || "Guest"}</span>
                            <span className="id">{order.userEmail || order.email || order.user?.email || ""}</span>
                            {order.userPhone && <span className="id">📞 {order.userPhone}</span>}
                          </ProductInfo>
                        </td>
                        <td>
                          <ProductInfo>
                            <span className="name">{order.items?.length || 0} item(s)</span>
                            <span className="id" style={{ fontSize: '0.7rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.items?.map(item => item.name).join(', ') || 'N/A'}
                            </span>
                          </ProductInfo>
                        </td>
                        <td>
                          <PriceDisplay>{formatPrice(order.totalAmount || order.totalPrice || order.total || 0)}</PriceDisplay>
                        </td>
                        <td>
                          <span style={{ color: "#666", fontSize: "0.9rem" }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={order.paymentStatus?.toLowerCase() || order.paymentInfo?.status?.toLowerCase() || "pending"}>
                            {order.paymentStatus || order.paymentInfo?.status || "Pending"}
                          </StatusBadge>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
                            {order.paymentMethod || order.paymentInfo?.type || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <OrderStatusSelect 
                            value={order.orderStatus || order.status || "placed"} 
                            onChange={(e) => updateOrderStatus(order._id || order.id, e.target.value)}
                            status={order.orderStatus || order.status || "placed"}
                          >
                            <option value="placed">📦 Placed</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="processing">⚙️ Processing</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">✔️ Delivered</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </OrderStatusSelect>
                        </td>
                        <td>
                          <ActionButtons>
                            <button className="view" onClick={() => viewOrderDetails(order)} title="View Details">
                              <FiEye />
                            </button>
                          </ActionButtons>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ProductTable>
              )}
            </TableContainer>
          </ContentSection>
        )}

        {/* Customers Section */}
        {activeNav === "customers" && (
          <ContentSection>
            <SectionHeader>
              <div className="title-area">
                <FiUsers className="section-icon" />
                <div>
                  <h2>Customer Management</h2>
                  <p>View registered customers and their activity</p>
                </div>
              </div>
            </SectionHeader>

            <TableContainer>
              {customers.length === 0 ? (
                <EmptyState>
                  <FiUsers />
                  <h3>No customers yet</h3>
                  <p>Customer data will appear here when users register</p>
                </EmptyState>
              ) : (
                <ProductTable>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id || customer.id}>
                        <td>
                          <ProductInfo>
                            <span className="name">{customer.name || "Unknown"}</span>
                            <span className="id">ID: {(customer._id || customer.id)?.slice(-6).toUpperCase()}</span>
                          </ProductInfo>
                        </td>
                        <td>
                          <span style={{ color: "#666", fontSize: "0.9rem" }}>
                            {customer.email || "N/A"}
                          </span>
                        </td>
                        <td>
                          <CategoryBadge>
                            {customer.role || "Customer"}
                          </CategoryBadge>
                        </td>
                        <td>
                          <span style={{ color: "#666", fontSize: "0.9rem" }}>
                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status="delivered">
                            Active
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ProductTable>
              )}
            </TableContainer>
          </ContentSection>
        )}

        {/* Coupons Section */}
        {activeNav === "coupons" && (
          <ContentSection>
            <SectionHeader>
              <div className="title-area">
                <FiTag className="section-icon" />
                <div>
                  <h2>Coupon Management</h2>
                  <p>Create and manage discount coupons</p>
                </div>
              </div>
              <AddButton onClick={() => { resetForm(); setEditingCoupon(null); setShowCouponModal(true); }}>
                <FiPlus /> Create Coupon
              </AddButton>
            </SectionHeader>

            <TableContainer>
              {coupons.length === 0 ? (
                <EmptyState>
                  <FiTag style={{ fontSize: "3rem", color: "#ccc", marginBottom: "1rem" }} />
                  <h3>No Coupons Yet</h3>
                  <p>Create your first coupon to offer discounts</p>
                </EmptyState>
              ) : (
                <ProductTable>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Min Order</th>
                      <th>Usage</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td>
                          <ProductInfo>
                            <span className="name" style={{ fontFamily: "monospace", fontWeight: 600 }}>{coupon.code}</span>
                            <span className="id">{coupon.description}</span>
                          </ProductInfo>
                        </td>
                        <td>
                          <PriceDisplay style={{ color: "#16a34a" }}>
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}%` 
                              : `₹${coupon.discountValue}`
                            }
                          </PriceDisplay>
                        </td>
                        <td>₹{coupon.minOrderValue || 0}</td>
                        <td>
                          <span style={{ color: "#666" }}>
                            {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            color: new Date(coupon.expiryDate) < new Date() ? "#dc2626" : "#666",
                            fontSize: "0.875rem"
                          }}>
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <StatusBadge 
                            status={coupon.isActive && new Date(coupon.expiryDate) > new Date() ? "delivered" : "cancelled"}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleToggleCoupon(coupon._id)}
                          >
                            {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? "Active" : "Inactive"}
                          </StatusBadge>
                        </td>
                        <td>
                          <ActionButtons>
                            <IconButton className="edit" onClick={() => handleEditCoupon(coupon)} title="Edit">
                              <FiEdit2 />
                            </IconButton>
                            <IconButton className="delete" onClick={() => handleDeleteCoupon(coupon._id)} title="Delete">
                              <FiTrash2 />
                            </IconButton>
                          </ActionButtons>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ProductTable>
              )}
            </TableContainer>
          </ContentSection>
        )}

        {/* Analytics Section */}
        {activeNav === "analytics" && (
          <ContentSection>
            <SectionHeader>
              <div className="title-area">
                <FiTrendingUp className="section-icon" />
                <div>
                  <h2>Analytics Dashboard</h2>
                  <p>Insights and performance metrics for your store</p>
                </div>
              </div>
            </SectionHeader>

            {/* Key Metrics */}
            <DashboardGrid>
              <DashboardCard className="sales">
                <div className="card-icon">
                  <FiDollarSign />
                </div>
                <div className="card-content">
                  <h3>Total Revenue</h3>
                  <span className="value">{formatPrice(dashboardStats.totalSales)}</span>
                  <span className="label">All time</span>
                </div>
              </DashboardCard>

              <DashboardCard className="orders">
                <div className="card-icon">
                  <FiShoppingCart />
                </div>
                <div className="card-content">
                  <h3>Avg. Order Value</h3>
                  <span className="value">
                    {orders.length > 0 ? formatPrice((dashboardStats.totalSales / orders.length)) : '₹0'}
                  </span>
                  <span className="label">Per order</span>
                </div>
              </DashboardCard>

              <DashboardCard className="customers">
                <div className="card-icon">
                  <FiPercent />
                </div>
                <div className="card-content">
                  <h3>Conversion Rate</h3>
                  <span className="value">
                    {orders.length > 0 && customers.length > 0 ? 
                      ((orders.length / customers.length) * 100).toFixed(1) : '0'}%
                  </span>
                  <span className="label">Orders / Customers</span>
                </div>
              </DashboardCard>

              <DashboardCard className="products">
                <div className="card-icon">
                  <FiPackage />
                </div>
                <div className="card-content">
                  <h3>Inventory Value</h3>
                  <span className="value">
                    {formatPrice(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
                  </span>
                  <span className="label">Stock × Price</span>
                </div>
              </DashboardCard>
            </DashboardGrid>

            {/* Sales by Category Chart */}
            <RecentSection style={{ marginTop: '2rem' }}>
              <h3>📊 Sales by Category</h3>
              <div style={{ marginTop: '1.5rem' }}>
                {(() => {
                  // Calculate sales by category
                  const categoryMap = {};
                  orders.forEach(order => {
                    (order.items || []).forEach(item => {
                      const cat = item.category || 'other';
                      if (!categoryMap[cat]) categoryMap[cat] = 0;
                      categoryMap[cat] += (item.price || 0) * (item.quantity || 1);
                    });
                  });
                  const totalSales = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
                  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
                  const colors = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3'];
                  
                  return categories.length > 0 ? categories.map(([cat, value], idx) => (
                    <div key={cat} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{getCategoryLabel(cat)}</span>
                        <span style={{ color: '#666' }}>{formatPrice(value)} ({((value / totalSales) * 100).toFixed(1)}%)</span>
                      </div>
                      <div style={{ 
                        height: '24px', 
                        background: '#f3f4f6', 
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(value / totalSales) * 100}%`,
                          height: '100%',
                          background: colors[idx % colors.length],
                          borderRadius: '12px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  )) : (
                    <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                      No sales data yet. Complete some orders to see category analytics.
                    </p>
                  );
                })()}
              </div>
            </RecentSection>

            {/* Order Status Distribution */}
            <RecentSection style={{ marginTop: '2rem' }}>
              <h3>📦 Order Status Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {[
                  { status: 'pending', label: 'Pending', color: '#f59e0b', icon: '⏳' },
                  { status: 'processing', label: 'Processing', color: '#3b82f6', icon: '🔄' },
                  { status: 'shipped', label: 'Shipped', color: '#8b5cf6', icon: '🚚' },
                  { status: 'delivered', label: 'Delivered', color: '#10b981', icon: '✅' },
                  { status: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: '❌' }
                ].map(({ status, label, color, icon }) => {
                  const count = orders.filter(o => 
                    (o.status || 'pending').toLowerCase() === status
                  ).length;
                  return (
                    <div key={status} style={{
                      padding: '1.5rem',
                      background: `${color}15`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: `2px solid ${color}30`
                    }}>
                      <span style={{ fontSize: '2rem' }}>{icon}</span>
                      <h4 style={{ margin: '0.5rem 0', fontSize: '2rem', color }}>{count}</h4>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </RecentSection>

            {/* Top Selling Products */}
            <RecentSection style={{ marginTop: '2rem' }}>
              <h3>🏆 Top Selling Products</h3>
              <TableContainer style={{ marginTop: '1.5rem', maxHeight: '300px', overflow: 'auto' }}>
                {(() => {
                  // Calculate product sales
                  const productSales = {};
                  orders.forEach(order => {
                    (order.items || []).forEach(item => {
                      const id = item.id || item.productId || item.name;
                      if (!productSales[id]) {
                        productSales[id] = { name: item.name, quantity: 0, revenue: 0, image: item.image };
                      }
                      productSales[id].quantity += item.quantity || 1;
                      productSales[id].revenue += (item.price || 0) * (item.quantity || 1);
                    });
                  });
                  const topProducts = Object.entries(productSales)
                    .sort((a, b) => b[1].quantity - a[1].quantity)
                    .slice(0, 5);
                  
                  return topProducts.length > 0 ? (
                    <ProductTable>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Units Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map(([id, data], idx) => (
                          <tr key={id}>
                            <td style={{ fontWeight: 'bold', color: idx === 0 ? '#f59e0b' : '#666' }}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </td>
                            <td>
                              <ProductInfo>
                                <span className="name">{data.name}</span>
                              </ProductInfo>
                            </td>
                            <td style={{ fontWeight: '600' }}>{data.quantity}</td>
                            <td style={{ fontWeight: '600', color: '#10b981' }}>{formatPrice(data.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </ProductTable>
                  ) : (
                    <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                      No product sales data yet.
                    </p>
                  );
                })()}
              </TableContainer>
            </RecentSection>

            {/* Recent Orders Timeline */}
            <RecentSection style={{ marginTop: '2rem' }}>
              <h3>📅 Recent Orders</h3>
              <div style={{ marginTop: '1.5rem' }}>
                {orders.slice(0, 5).length > 0 ? orders.slice(0, 5).map((order, idx) => (
                  <div key={order._id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderLeft: '3px solid #8B4513',
                    marginBottom: '0.75rem',
                    background: '#faf8f5',
                    borderRadius: '0 8px 8px 0'
                  }}>
                    <span style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: '#8B4513', 
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600' }}>
                        #{order.orderId || (order._id || order.id)?.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {order.userName || 'Guest'} • {order.items?.length || 0} items • {formatPrice(order.totalAmount || 0)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StatusBadge status={(order.status || 'pending').toLowerCase()}>
                        {order.status || 'Pending'}
                      </StatusBadge>
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.3rem' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                    No orders yet.
                  </p>
                )}
              </div>
            </RecentSection>
          </ContentSection>
        )}

        {/* Profile Section */}
        {activeNav === "profile" && (
          <ContentSection>
            <SectionHeader>
              <div className="title-area">
                <FiEye className="section-icon" />
                <div>
                  <h2>Admin Profile</h2>
                  <p>Manage your account settings and information</p>
                </div>
              </div>
            </SectionHeader>

            <ProfileContainer>
              {/* Profile Card */}
              <ProfileCard>
                <div className="profile-banner"></div>
                <div className="profile-content">
                  <div className="avatar-section">
                    <div className="profile-avatar">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt="Admin" />
                      ) : (
                        <span className="initials">AK</span>
                      )}
                    </div>
                    <div className="profile-info">
                      <h3>Abhishek Kumar</h3>
                      <p className="role">Super Administrator</p>
                      <p className="email">{userEmailState}</p>
                    </div>
                  </div>
                  
                  <div className="profile-stats">
                    <div className="stat-item">
                      <div className="stat-icon"><FiPackage /></div>
                      <div>
                        <span className="stat-value">{products.length}</span>
                        <span className="stat-label">Products Managed</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon"><FiShoppingCart /></div>
                      <div>
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">Orders Processed</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon"><FiUsers /></div>
                      <div>
                        <span className="stat-value">{customers.length}</span>
                        <span className="stat-label">Customers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ProfileCard>

              {/* Account Details */}
              <ProfileDetailsGrid>
                <ProfileDetailCard>
                  <div className="card-header">
                    <FiUser className="header-icon" />
                    <h4>Personal Information</h4>
                  </div>
                  <div className="card-body">
                    <div className="detail-row">
                      <span className="label">Full Name</span>
                      <span className="value">Abhishek Kumar</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Email Address</span>
                      <span className="value">{userEmailState}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Role</span>
                      <span className="value">
                        <StatusBadge status="delivered">Super Admin</StatusBadge>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Account Status</span>
                      <span className="value">
                        <StatusBadge status="delivered">Active</StatusBadge>
                      </span>
                    </div>
                  </div>
                </ProfileDetailCard>

                <ProfileDetailCard>
                  <div className="card-header">
                    <FiShield className="header-icon" />
                    <h4>Security & Access</h4>
                  </div>
                  <div className="card-body">
                    <div className="detail-row">
                      <span className="label">Authentication</span>
                      <span className="value">Clerk Auth</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Two-Factor Auth</span>
                      <span className="value">
                        <StatusBadge status="delivered">Enabled</StatusBadge>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Last Login</span>
                      <span className="value">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Sessions</span>
                      <span className="value">1 Active</span>
                    </div>
                  </div>
                </ProfileDetailCard>

                <ProfileDetailCard>
                  <div className="card-header">
                    <FiSettings className="header-icon" />
                    <h4>Store Information</h4>
                  </div>
                  <div className="card-body">
                    <div className="detail-row">
                      <span className="label">Store Name</span>
                      <span className="value">Sawaikar's Cashew Store</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Business Type</span>
                      <span className="value">Cashew Processing & Retail</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Store Status</span>
                      <span className="value">
                        <StatusBadge status="delivered">Active</StatusBadge>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Admin Since</span>
                      <span className="value">January 2026</span>
                    </div>
                  </div>
                </ProfileDetailCard>

                <ProfileDetailCard>
                  <div className="card-header">
                    <FiActivity className="header-icon" />
                    <h4>Activity Summary</h4>
                  </div>
                  <div className="card-body">
                    <div className="detail-row">
                      <span className="label">Total Sales</span>
                      <span className="value">{formatPrice(dashboardStats.totalSales)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Orders Today</span>
                      <span className="value">{orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Pending Orders</span>
                      <span className="value">{orders.filter(o => o.status === 'Pending' || o.status === 'pending').length}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Low Stock Items</span>
                      <span className="value">{products.filter(p => p.stock < 10).length}</span>
                    </div>
                  </div>
                </ProfileDetailCard>
              </ProfileDetailsGrid>

              {/* Quick Actions */}
              <ProfileActionsCard>
                <h4>Quick Actions</h4>
                <div className="actions-grid">
                  <button className="action-btn" onClick={() => setActiveNav('inventory')}>
                    <FiPackage />
                    <span>Manage Products</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveNav('orders')}>
                    <FiShoppingCart />
                    <span>View Orders</span>
                  </button>
                  <button className="action-btn" onClick={() => setActiveNav('customers')}>
                    <FiUsers />
                    <span>View Customers</span>
                  </button>
                  <button className="action-btn danger" onClick={() => { signOut(); navigate('/'); }}>
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </div>
              </ProfileActionsCard>
            </ProfileContainer>
          </ContentSection>
        )}

        </ContentWrapper>

        {/* Admin Footer */}
        <AdminFooter>
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-icon">🥜</span>
              <span>Sawaikar's Cashew Store</span>
            </div>
            <div className="footer-info">
              <span>Admin Dashboard v1.0</span>
              <span className="separator">•</span>
              <span>Made with 💛 by Abhishek Kumar</span>
            </div>
            <div className="footer-links">
              <a href="/">Back to Store</a>
              <span className="separator">•</span>
              <span>© 2026 All Rights Reserved</span>
            </div>
          </div>
        </AdminFooter>
      </MainContent>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderModal onClick={() => setShowOrderModal(false)}>
          <OrderModalContent onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Order Details - #{selectedOrder.orderId || (selectedOrder._id || selectedOrder.id)?.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setShowOrderModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              {/* Customer Info */}
              <div className="order-section">
                <h4>👤 Customer Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name</label>
                    <span>{selectedOrder.userName || selectedOrder.customerName || 'Guest'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{selectedOrder.userEmail || selectedOrder.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <span>{selectedOrder.userPhone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Order Date</label>
                    <span>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="order-section">
                <h4>🚚 Shipping Address</h4>
                <div className="info-grid">
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <label>Address</label>
                    <span>
                      {selectedOrder.shippingInfo?.address || selectedOrder.shippingAddress?.street || 'N/A'}
                      {selectedOrder.shippingInfo?.city && `, ${selectedOrder.shippingInfo.city}`}
                      {selectedOrder.shippingInfo?.state && `, ${selectedOrder.shippingInfo.state}`}
                      {selectedOrder.shippingInfo?.pincode && ` - ${selectedOrder.shippingInfo.pincode}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="order-section">
                <h4>📋 Order Status</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Order Status</label>
                    <StatusBadge status={selectedOrder.orderStatus || selectedOrder.status || 'placed'}>
                      {selectedOrder.orderStatus || selectedOrder.status || 'Placed'}
                    </StatusBadge>
                  </div>
                  <div className="info-item">
                    <label>Payment Status</label>
                    <StatusBadge status={selectedOrder.paymentStatus || 'pending'}>
                      {selectedOrder.paymentStatus || 'Pending'}
                    </StatusBadge>
                  </div>
                  <div className="info-item">
                    <label>Payment Method</label>
                    <span style={{ textTransform: 'uppercase' }}>{selectedOrder.paymentMethod || selectedOrder.paymentInfo?.type || 'N/A'}</span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="info-item">
                      <label>Transaction ID</label>
                      <span>{selectedOrder.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-section">
                <h4>🛒 Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item">
                      <div className="item-info">
                        {item.image && <img src={item.image} alt={item.name} />}
                        <div>
                          <div className="item-name">{item.name}</div>
                          <div className="item-qty">Qty: {item.quantity} × ₹{toRupees(item.price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                      </div>
                      <div className="item-price">₹{(toRupees(item.price || 0) * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                  )) || <p>No items</p>}
                </div>
                <div className="total-row">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{toRupees(selectedOrder.totalAmount || selectedOrder.totalPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </OrderModalContent>
        </OrderModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <DeleteModalOverlay onClick={closeDeleteModal}>
          <DeleteModalContent onClick={(e) => e.stopPropagation()}>
            <DeleteIcon>
              <FiTrash2 />
            </DeleteIcon>
            <DeleteModalTitle>Delete Product?</DeleteModalTitle>
            <DeleteModalMessage>
              Are you sure you want to delete <strong>{deleteModal.productName}</strong>? 
              This action cannot be undone.
            </DeleteModalMessage>
            <DeleteModalActions>
              <DeleteCancelButton onClick={closeDeleteModal}>
                Cancel
              </DeleteCancelButton>
              <DeleteConfirmButton onClick={confirmDelete}>
                <FiTrash2 /> Delete
              </DeleteConfirmButton>
            </DeleteModalActions>
          </DeleteModalContent>
        </DeleteModalOverlay>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div className="modal-title">
                <span className="icon">{editingProduct ? <FiEdit2 /> : <FiPackage />}</span>
                <div>
                  <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                  <p>{editingProduct ? "Update product information" : "Enter product details and specifications"}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </ModalHeader>

            <ModalBody>
              <form onSubmit={handleSubmit}>
                {/* Product Name */}
                <FormGroup className="full-width">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Premium Roasted Cashews W240"
                  />
                </FormGroup>

                {/* Two Column Grid */}
                <FormRow>
                  <FormGroup>
                    <label>Price (₹) *</label>
                    <div className="input-with-prefix">
                      <span className="prefix">₹</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="1680"
                      />
                    </div>
                    <small style={{ color: '#78716c', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Enter price in rupees (e.g., 1680 for ₹1,680.00)
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <label>Stock Quantity *</label>
                    <div className="input-with-prefix">
                      <span className="prefix"><FiPackage /></span>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select the item category</option>
                      <option value="roasted">Roasted Cashews</option>
                      <option value="salted">Salted Nuts</option>
                      <option value="flavored">Flavored Varieties</option>
                      <option value="raw">Raw Cashews</option>
                      <option value="seeds">Seeds & Kernels</option>
                      <option value="dry-fruits">Dry Fruits</option>
                      <option value="gift-packs">Gift Packs</option>
                      <option value="combo">Combo Packs</option>
                      <option value="sweets">Sweets & Treats</option>
                      <option value="other">Other Products</option>
                    </select>
                  </FormGroup>

                  <FormGroup>
                    <label>Rating</label>
                    <div className="input-with-prefix">
                      <span className="prefix"><FiStar /></span>
                      <input
                        type="number"
                        name="stars"
                        value={formData.stars}
                        onChange={handleInputChange}
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="4.5"
                      />
                    </div>
                  </FormGroup>
                </FormRow>

                {/* Description */}
                <FormGroup className="full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter product description..."
                  />
                </FormGroup>

                {/* Image Upload Section */}
                <FormGroup className="full-width">
                  <label>Image URL(s)</label>
                  <ImageUploadArea>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="Paste image URL(s) separated by commas"
                    />
                    <p className="hint">Enter one or multiple image URLs separated by commas</p>
                  </ImageUploadArea>
                </FormGroup>

                {/* Checkboxes */}
                <CheckboxRow>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <div className="label-content">
                      <FiStar />
                      <div>
                        <strong>Featured Product</strong>
                        <small>Display on homepage</small>
                      </div>
                    </div>
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      name="shipping"
                      checked={formData.shipping}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <div className="label-content">
                      <FiTruck />
                      <div>
                        <strong>Free Shipping</strong>
                        <small>No delivery charges</small>
                      </div>
                    </div>
                  </CheckboxLabel>
                </CheckboxRow>

                {/* Weight Variants Section */}
                <FormGroup className="full-width" style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📦 Weight Variants</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newVariant = { weight: '250g', price: formData.price || '', stock: 10, sku: '' };
                        setFormData(prev => ({
                          ...prev,
                          variants: [...(prev.variants || []), newVariant]
                        }));
                      }}
                      style={{
                        background: '#8B4513',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <FiPlus /> Add Variant
                    </button>
                  </label>
                  
                  {formData.variants && formData.variants.length > 0 ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {formData.variants.map((variant, index) => (
                        <div key={index} style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr 1fr auto',
                          gap: '0.75rem',
                          padding: '1rem',
                          background: '#f8f4ed',
                          borderRadius: '8px',
                          border: '1px solid #e0d4c3'
                        }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Weight</label>
                            <select
                              value={variant.weight}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].weight = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            >
                              {weightOptions.map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Price (₹)</label>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].price = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                              placeholder="Price"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Stock</label>
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index].stock = e.target.value;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                              placeholder="Stock"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newVariants = formData.variants.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, variants: newVariants }));
                            }}
                            style={{
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              width: '36px',
                              height: '36px',
                              cursor: 'pointer',
                              alignSelf: 'end',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                      No variants added. Click "Add Variant" to create weight options for this product.
                    </p>
                  )}

                  {formData.variants && formData.variants.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', color: '#666' }}>Default Weight Option</label>
                      <select
                        value={formData.defaultWeight}
                        onChange={(e) => setFormData(prev => ({ ...prev, defaultWeight: e.target.value }))}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', marginTop: '0.3rem' }}
                      >
                        {formData.variants.map((v, i) => (
                          <option key={i} value={v.weight}>{v.weight}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </FormGroup>

                {/* Form Actions */}
                <FormActions>
                  <CancelButton type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </CancelButton>
                  <SubmitButton type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner"></span>
                        Saving...
                      </>
                    ) : editingProduct ? (
                      <>
                        <FiCheck /> Update Product
                      </>
                    ) : (
                      <>
                        <FiPlus /> Add Product
                      </>
                    )}
                  </SubmitButton>
                </FormActions>
              </form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <ModalOverlay onClick={() => setShowCouponModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <ModalHeader>
              <div className="modal-title">
                <span className="icon"><FiTag /></span>
                <div className="text">
                  <h2>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</h2>
                  <p>{editingCoupon ? "Update coupon details" : "Set up a new discount coupon"}</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowCouponModal(false)}>
                <FiX />
              </button>
            </ModalHeader>

            <ModalBody>
              <form onSubmit={handleCouponSubmit}>
                <FormGroup>
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingCoupon}
                    placeholder="e.g., SAVE20, NEWYEAR"
                    style={{ textTransform: "uppercase", fontFamily: "monospace" }}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 20% off on all products"
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <label>Discount Type *</label>
                    <select
                      name="discountType"
                      value={formData.discountType || 'percentage'}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </FormGroup>

                  <FormGroup>
                    <label>Discount Value *</label>
                    <div className="input-with-prefix">
                      <span className="prefix">{formData.discountType === 'percentage' ? '%' : '₹'}</span>
                      <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue || ''}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        placeholder="0"
                      />
                    </div>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <label>Min Order Value (₹)</label>
                    <div className="input-with-prefix">
                      <span className="prefix">₹</span>
                      <input
                        type="number"
                        name="minOrderValue"
                        value={formData.minOrderValue || ''}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <label>Max Discount (₹)</label>
                    <div className="input-with-prefix">
                      <span className="prefix">₹</span>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount || ''}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="No limit"
                      />
                    </div>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate || ''}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit || ''}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Unlimited"
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup className="checkbox-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    id="couponActive"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: "auto" }}
                  />
                  <label htmlFor="couponActive" style={{ margin: 0 }}>Coupon is active</label>
                </FormGroup>

                <FormActions>
                  <CancelButton type="button" onClick={() => setShowCouponModal(false)}>
                    Cancel
                  </CancelButton>
                  <SubmitButton type="submit" disabled={saving}>
                    {saving ? (
                      <>Saving...</>
                    ) : editingCoupon ? (
                      <>
                        <FiCheck /> Update Coupon
                      </>
                    ) : (
                      <>
                        <FiPlus /> Create Coupon
                      </>
                    )}
                  </SubmitButton>
                </FormActions>
              </form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Low Stock Quick Restock Modal */}
      {showLowStockModal && (
        <ModalOverlay onClick={() => setShowLowStockModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <ModalHeader>
              <div className="modal-title">
                <span className="icon"><FiAlertTriangle /></span>
                <div className="text">
                  <h2>Quick Restock</h2>
                  <p>Update stock levels for low inventory items</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowLowStockModal(false)}>
                <FiX />
              </button>
            </ModalHeader>
            <ModalBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {getLowStockProducts().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <FiCheck style={{ fontSize: '3rem', color: '#27ae60', marginBottom: '1rem' }} />
                  <h3>All Stock Levels Healthy!</h3>
                  <p>No products are below the threshold of {lowStockThreshold} units.</p>
                </div>
              ) : (
                <TableContainer>
                  <ProductTable>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Current</th>
                        <th>New Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLowStockProducts().map(product => (
                        <tr key={product.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img 
                                src={Array.isArray(product.image) ? product.image[0] : product.image} 
                                alt={product.name}
                                style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = './images/premium.jpg'; }}
                              />
                              <span style={{ fontWeight: '500' }}>{product.name}</span>
                            </div>
                          </td>
                          <td>
                            <CategoryBadge>{getCategoryLabel(product.category)}</CategoryBadge>
                          </td>
                          <td>
                            <span style={{ 
                              color: product.stock === 0 ? '#e74c3c' : product.stock <= 3 ? '#f39c12' : '#3498db',
                              fontWeight: 'bold'
                            }}>
                              {product.stock}
                            </span>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              defaultValue={product.stock + 50}
                              id={`restock-${product.id}`}
                              style={{ 
                                width: '100px', 
                                padding: '0.5rem', 
                                borderRadius: '6px', 
                                border: '1px solid #ddd',
                                textAlign: 'center'
                              }}
                            />
                          </td>
                          <td>
                            <SubmitButton
                              type="button"
                              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                              onClick={() => {
                                const input = document.getElementById(`restock-${product.id}`);
                                if (input && input.value) {
                                  handleQuickStockUpdate(product.id, input.value);
                                }
                              }}
                            >
                              <FiCheck /> Update
                            </SubmitButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ProductTable>
                </TableContainer>
              )}
              <FormActions style={{ marginTop: '1.5rem' }}>
                <CancelButton type="button" onClick={() => setShowLowStockModal(false)}>
                  Close
                </CancelButton>
                <SubmitButton 
                  type="button" 
                  onClick={() => {
                    getLowStockProducts().forEach(product => {
                      const input = document.getElementById(`restock-${product.id}`);
                      if (input && input.value) {
                        handleQuickStockUpdate(product.id, input.value);
                      }
                    });
                    setShowLowStockModal(false);
                  }}
                >
                  <FiCheck /> Restock All
                </SubmitButton>
              </FormActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardWrapper>
  );
};

// Wrapper component with Error Boundary
const AdminProduct = () => {
  return (
    <ErrorBoundary>
      <AdminProductContent />
    </ErrorBoundary>
  );
};

// Styled Components - Using theme colors (NO BLUE!)
const DashboardWrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.bg || '#FFF8DC'};
  position: relative;
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  gap: 1rem;
  background: #FFF8DC;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(205, 133, 63, 0.3);
    border-top-color: #CD853F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    color: #333;
    font-size: 1.1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
  background: #FFF8DC;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h1 {
    color: #c0392b;
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }

  .email, .required {
    margin-top: 1rem;
    padding: 1rem;
    background: ${({ theme }) => theme.colors.white};
    border-radius: 0.5rem;
    font-family: monospace;
  }
`;

// Sidebar Styles
const Sidebar = styled.aside`
  width: 260px;
  background: ${({ theme }) => theme.colors.footer_bg};
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    width: 70px;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    font-size: 2rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.5rem;
    border-radius: 0.75rem;
  }

  .logo-text {
    h3 {
      color: ${({ theme }) => theme.colors.white};
      font-size: 1.2rem;
      margin: 0;
    }
    span {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .logo-text { display: none; }
    padding: 1rem;
  }
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.white};
  }

  &.active {
    background: ${({ theme }) => theme.colors.helper};
    color: ${({ theme }) => theme.colors.white};
    border-left: 4px solid ${({ theme }) => theme.colors.white};
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
    justify-content: center;
    span { display: none; }
  }
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .admin-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .info {
    display: flex;
    flex-direction: column;

    .name {
      color: ${({ theme }) => theme.colors.white};
      font-weight: 600;
      font-size: 0.9rem;
    }

    .email {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.7rem;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .info { display: none; }
    padding: 1rem;
  }
`;

const SidebarDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 1rem 1.5rem;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    margin: 1rem;
  }
`;

const BackToStoreLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  color: ${({ theme }) => theme.colors.btn};
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  margin: 0 0.75rem;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    background: rgba(205, 133, 63, 0.2);
    color: ${({ theme }) => theme.colors.white};
    transform: translateX(5px);
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
    margin: 0 0.5rem;
    justify-content: center;
    
    span { display: none; }
  }
`;

// Main Content Styles
const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 0;
  background: #FFF7ED;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    margin-left: 70px;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 68px;
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 50%, #FFF5EB 100%);
  border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, #C4956A 0%, #D4A574 50%, #E8C9A8 100%) 1;
  box-shadow: 0 2px 12px rgba(139, 90, 43, 0.08), 0 1px 3px rgba(196, 149, 106, 0.12);
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 1.5rem;

  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .hamburger-btn {
    display: none;
    background: linear-gradient(135deg, #C4956A 0%, #B8845A 100%);
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(196, 149, 106, 0.3);

    &:hover {
      background: linear-gradient(135deg, #B8845A 0%, #A67545 100%);
      transform: scale(1.05);
      box-shadow: 0 3px 10px rgba(196, 149, 106, 0.4);
    }

    @media (max-width: ${({ theme }) => theme.media.mobile}) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(196, 149, 106, 0.1) 0%, rgba(212, 165, 116, 0.08) 100%);
    border-radius: 0.75rem;
    border: 1px solid rgba(196, 149, 106, 0.2);

    .brand-icon {
      font-size: 1.5rem;
      filter: drop-shadow(0 1px 2px rgba(139, 90, 43, 0.2));
    }

    .brand-text {
      font-size: 1.05rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8B5A2B 0%, #A67545 50%, #C4956A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }
  }

  .right-section {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex-shrink: 0;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 0 1rem;
    height: 60px;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 600px;
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%);
  border: 1.5px solid rgba(196, 149, 106, 0.25);
  border-radius: 9999px;
  padding: 0 1.25rem;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(139, 90, 43, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.8);

  &:focus-within {
    background: white;
    border-color: #C4956A;
    box-shadow: 0 0 0 4px rgba(196, 149, 106, 0.15), 0 4px 12px rgba(139, 90, 43, 0.1);
    transform: translateY(-1px);
  }

  .search-icon {
    color: #A67545;
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem 0.875rem;
    font-size: 0.9rem;
    color: #1c1917;
    outline: none;
    font-weight: 450;

    &::placeholder {
      color: #a8a29e;
      font-weight: 400;
    }
  }

  .clear-btn {
    background: transparent;
    border: none;
    color: #A67545;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.15s ease;

    &:hover {
      background: #e7e5e4;
      color: #44403c;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    max-width: none;
    flex: 0;
    width: 40px;
    padding: 0;
    justify-content: center;
    border-radius: 0.375rem;

    input,
    .clear-btn {
      display: none;
    }

    .search-icon {
      margin: 0.5rem;
    }
  }
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  .breadcrumb {
    color: #78716c;
    text-decoration: none;
    transition: color 0.15s ease;
    white-space: nowrap;

    &:hover {
      color: #44403c;
    }

    &.active {
      color: #1c1917;
      font-weight: 600;
    }
  }

  .separator {
    color: #d6d3d1;
    font-size: 0.75rem;
    user-select: none;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    display: none;
  }
`;

const WelcomeGreeting = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1.125rem;
  border-radius: 0.75rem;
  margin-right: 0.75rem;
  background: linear-gradient(135deg, rgba(196, 149, 106, 0.12) 0%, rgba(212, 165, 116, 0.08) 100%);
  border: 1px solid rgba(196, 149, 106, 0.2);

  .greeting-text {
    font-size: 0.9375rem;
    font-weight: 600;
    background: linear-gradient(135deg, #8B5A2B 0%, #A67545 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
  }

  .greeting-icon {
    font-size: 1.125rem;
    color: #A67545;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    display: none;
  }
`;

const QuickAction = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1.5px solid rgba(196, 149, 106, 0.3);
  border-radius: 0.625rem;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%);
  color: #8B5A2B;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(139, 90, 43, 0.08);

  &:hover {
    background: linear-gradient(135deg, #C4956A 0%, #B8845A 100%);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(196, 149, 106, 0.35);
  }

  svg {
    font-size: 1rem;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 0.5rem;
    span {
      display: none;
    }
  }
`;

const NotificationButton = styled.button`
  position: relative;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%);
  border: 1.5px solid rgba(196, 149, 106, 0.25);
  width: 42px;
  height: 42px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #A67545;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(139, 90, 43, 0.08);

  svg {
    font-size: 1.125rem;
  }

  &:hover {
    background: linear-gradient(135deg, #C4956A 0%, #B8845A 100%);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(196, 149, 106, 0.35);
  }

  .dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #C4956A 0%, #B8845A 100%);
    border-radius: 50%;
    border: 2px solid #FFF8F0;
    box-shadow: 0 1px 3px rgba(196, 149, 106, 0.4);
  }
`;

const ProfileMenu = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.875rem 0.5rem 0.5rem;
  border: 1.5px solid rgba(196, 149, 106, 0.25);
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%);
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(139, 90, 43, 0.08);

  &:hover {
    background: linear-gradient(135deg, rgba(196, 149, 106, 0.1) 0%, rgba(212, 165, 116, 0.08) 100%);
    border-color: #C4956A;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(196, 149, 106, 0.15);
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #C4956A 0%, #A67545 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(196, 149, 106, 0.4);
    border: 2px solid #FFF8F0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;

    .name {
      font-size: 0.9rem;
      font-weight: 700;
      background: linear-gradient(135deg, #8B5A2B 0%, #A67545 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.3;
    }

    .role {
      font-size: 0.75rem;
      color: #A67545;
      font-weight: 500;
      line-height: 1.2;
    }
  }

  .chevron {
    color: #A67545;
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  ${({ $isOpen }) => $isOpen && `
    .chevron {
      transform: rotate(180deg);
    }
  `}

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 0.375rem;
    gap: 0;

    .user-info,
    .chevron {
      display: none;
    }
  }
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%);
  border: 1.5px solid rgba(196, 149, 106, 0.2);
  border-radius: 0.875rem;
  box-shadow: 0 15px 40px rgba(139, 90, 43, 0.15), 0 5px 15px rgba(196, 149, 106, 0.1);
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem;
    background: #fef3c7;
    border-bottom: 1px solid #fed7aa;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #92400e;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 600;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1c1917;
        margin-bottom: 0.125rem;
      }

      .email {
        font-size: 0.75rem;
        color: #78716c;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .menu-divider {
    height: 1px;
    background: #fed7aa;
    margin: 0.25rem 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: #57534e;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: all 0.15s ease;

    svg {
      font-size: 1rem;
      color: #78716c;
    }

    &:hover {
      background: #fef3c7;
      color: #1c1917;

      svg {
        color: #c2410c;
      }
    }

    &.danger {
      color: #dc2626;

      svg {
        color: #dc2626;
      }

      &:hover {
        background: #fef2f2;
        color: #b91c1c;

        svg {
          color: #b91c1c;
        }
      }
    }
  }
`;

const NotificationWrapper = styled.div`
  position: relative;
`;

const NotificationBadge = styled.button`
  position: relative;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%);
  border: 1.5px solid rgba(196, 149, 106, 0.25);
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(139, 90, 43, 0.08);

  svg {
    font-size: 1.25rem;
    color: #A67545;
  }

  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: linear-gradient(135deg, #C4956A 0%, #B8845A 100%);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(196, 149, 106, 0.4);
    border: 2px solid #FFF8F0;
  }

  &:hover {
    background: linear-gradient(135deg, #C4956A 0%, #B8845A 100%);
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(196, 149, 106, 0.35);

    svg {
      color: white;
    }
  }
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 380px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: ${({ theme }) => theme.colors.footer_bg};
    color: white;

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
    }
  }

  .dropdown-tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;

    button {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      font-size: 0.85rem;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;

      &:hover {
        background: #FFF8DC;
      }

      &.active {
        color: ${({ theme }) => theme.colors.footer_bg};
        border-bottom-color: ${({ theme }) => theme.colors.footer_bg};
        background: #FFF8DC;
      }
    }
  }

  .dropdown-body {
    max-height: 280px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.btn} #f3f4f6;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.btn};
      border-radius: 4px;
      min-height: 40px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }) => theme.colors.footer_bg};
    }
  }

  .notification-item {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s ease;
    position: relative;

    &:hover {
      background: #FFF8DC;

      .notif-actions {
        opacity: 1;
      }
    }

    &:last-child {
      border-bottom: none;
    }

    &.read {
      opacity: 0.7;
      background: #f9f9f9;
    }

    .notif-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .notif-content {
      flex: 1;

      strong {
        display: block;
        font-size: 0.9rem;
        color: #333;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.8rem;
        color: #666;
        margin: 0;
        line-height: 1.4;
      }

      .notif-time {
        font-size: 0.7rem;
        color: #999;
        margin-top: 0.25rem;
        display: block;
      }
    }

    .notif-actions {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s ease;

      button {
        width: 24px;
        height: 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &.mark-read {
          background: #10b981;
          color: white;

          &:hover {
            background: #059669;
          }
        }

        &.delete {
          background: #ef4444;
          color: white;

          &:hover {
            background: #dc2626;
          }
        }
      }
    }

    &.warning {
      border-left: 3px solid #f59e0b;
    }

    &.info {
      border-left: 3px solid #CD853F;
    }

    &.success {
      border-left: 3px solid #10b981;
    }
  }

  .empty-notifications {
    padding: 2.5rem;
    text-align: center;
    color: #666;

    span {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    p {
      margin: 0;
      font-size: 0.95rem;
    }
  }

  .dropdown-footer {
    padding: 0.75rem 1.25rem;
    border-top: 1px solid #f3f4f6;
    display: flex;
    justify-content: center;
    gap: 0.5rem;

    button {
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.btn};
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;

      &:hover {
        background: #FFF8DC;
      }

      &.mark-all {
        background: #10b981;
        color: white;

        &:hover {
          background: #059669;
        }
      }

      &.clear-all {
        background: #ef4444;
        color: white;

        &:hover {
          background: #dc2626;
        }
      }
    }
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.colors.footer_bg};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 0.625rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    font-size: 1.1rem;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.helper};
    transform: translateY(-2px);
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 0.75rem;
    span { display: none; }
  }
`;

const StatsHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.footer_bg} 0%, ${({ theme }) => theme.colors.btn} 100%);

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    grid-template-columns: 1fr;
    padding: 1rem;
    gap: 1rem;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
  }
`;

// Dashboard View Components
const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DashboardCard = styled.div`
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(251, 146, 60, 0.1), 0 2px 4px -1px rgba(251, 146, 60, 0.06);\n  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.15), 0 4px 6px -2px rgba(251, 146, 60, 0.1);\n    border-color: #fb923c;
  }

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
  }

  &.sales .card-icon {
    background: linear-gradient(135deg, #ea580c, #fb923c);
  }

  &.orders .card-icon {
    background: linear-gradient(135deg, #c2410c, #ea580c);
  }

  &.customers .card-icon {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
  }

  &.products .card-icon {
    background: linear-gradient(135deg, #d97706, #f59e0b);
  }

  .card-content {
    flex: 1;

    h3 {
      font-size: 0.9rem;
      color: #78716c;
      margin-bottom: 0.25rem;
      font-weight: 500;
    }

    .value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1c1917;
      display: block;
    }

    .label {
      font-size: 0.8rem;
      color: #a8a29e;
    }
  }
`;

const RecentSection = styled.div`
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(251, 146, 60, 0.1);

  h3 {
    font-size: 1.25rem;
    color: #1c1917;
    margin-bottom: 1rem;
    font-weight: 600;
  }
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const QuickStatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%);
  border-radius: 0.875rem;
  border: 1.5px solid rgba(196, 149, 106, 0.15);
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(139, 90, 43, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(139, 90, 43, 0.12);
    border-color: rgba(196, 149, 106, 0.3);
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(196, 149, 106, 0.15) 0%, rgba(196, 149, 106, 0.08) 100%);
    color: #A67545;
    border: 1px solid rgba(196, 149, 106, 0.2);
  }

  &.need-roasting .icon-wrapper {
    background: linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, rgba(234, 88, 12, 0.06) 100%);
    color: #EA580C;
    border-color: rgba(234, 88, 12, 0.2);
  }

  &.premium .icon-wrapper {
    background: linear-gradient(135deg, rgba(202, 138, 4, 0.12) 0%, rgba(202, 138, 4, 0.06) 100%);
    color: #CA8A04;
    border-color: rgba(202, 138, 4, 0.2);
  }

  &.awaiting .icon-wrapper {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%);
    color: #3B82F6;
    border-color: rgba(59, 130, 246, 0.2);
  }

  &.delivered .icon-wrapper {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%);
    color: #22C55E;
    border-color: rgba(34, 197, 94, 0.2);
  }

  div {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;

    strong {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1c1917 0%, #44403c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    span {
      font-size: 0.85rem;
      color: #78716c;
      font-weight: 500;
    }
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileCard = styled.div`
  background: white;
  border: 1px solid #fed7aa;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(251, 146, 60, 0.1), 0 2px 4px -1px rgba(251, 146, 60, 0.06);

  .profile-banner {
    height: 120px;
    background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
  }

  .profile-content {
    padding: 0 2rem 2rem;
    margin-top: -50px;
  }

  .avatar-section {
    display: flex;
    align-items: flex-end;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: ${({ theme }) => theme.media.mobile}) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: white;
    border: 4px solid white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .initials {
      font-size: 2.5rem;
      font-weight: 700;
      color: #92400e;
    }
  }

  .profile-info {
    padding-top: 1rem;

    h3 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f5f5f4;
      margin: 0 0 0.25rem;
    }

    .role {
      font-size: 1rem;
      font-weight: 600;
      color: #ea580c;
      margin: 0 0 0.5rem;
    }

    .email {
      font-size: 0.875rem;
      color: #a8a29e;
      margin: 0;
    }
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    padding-top: 2rem;
    border-top: 1px solid #fed7aa;

    @media (max-width: ${({ theme }) => theme.media.mobile}) {
      grid-template-columns: 1fr;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.5rem;
      background: #fed7aa;
      border: 1px solid #fef3c7;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c2410c;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1c1917;
      line-height: 1.2;
    }

    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #78716c;
      line-height: 1.2;
    }
  }
`;

const ProfileDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const ProfileDetailCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #fed7aa;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(251, 146, 60, 0.1);

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    background: #fef3c7;
    border-bottom: 1px solid #fed7aa;

    .header-icon {
      font-size: 1.25rem;
      color: #c2410c;
    }

    h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1c1917;
      margin: 0;
    }
  }

  .card-body {
    padding: 1.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 0;
    border-bottom: 1px solid #fef3c7;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }

    .label {
      font-size: 0.875rem;
      color: #78716c;
      font-weight: 500;
    }

    .value {
      font-size: 0.875rem;
      color: #1c1917;
      font-weight: 600;
      text-align: right;
    }
  }
`;

const ProfileActionsCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #fed7aa;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(251, 146, 60, 0.1);

  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1c1917;
    margin: 0 0 1.25rem;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;

    @media (max-width: ${({ theme }) => theme.media.mobile}) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem;
    background: #fffbeb;
    border: 1px solid #fef3c7;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 0.875rem;
    font-weight: 600;
    color: #57534e;

    svg {
      font-size: 1.5rem;
      color: #c2410c;
    }

    &:hover {
      background: white;
      border-color: #fb923c;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(251, 146, 60, 0.15);
      color: #1c1917;
    }

    &.danger {
      svg {
        color: #dc2626;
      }

      &:hover {
        border-color: #dc2626;
        color: #dc2626;
      }
    }
  }
`;

const AdminFooter = styled.footer`
  padding: 1.25rem 2rem;
  background: ${({ theme }) => theme.colors.footer_bg};

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1rem;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.white};
    font-weight: 600;
    font-size: 1rem;

    .logo-icon {
      font-size: 1.25rem;
    }
  }

  .footer-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }

  .footer-links {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;

    a {
      color: ${({ theme }) => theme.colors.btn};
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: ${({ theme }) => theme.colors.white};
      }
    }
  }

  .separator {
    opacity: 0.5;
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }
`;

const TopHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;

  .greeting {
    h1 {
      color: ${({ theme }) => theme.colors.heading};
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }
    p {
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .header-stats {
    display: flex;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #fed7aa;
  box-shadow: 0 4px 6px -1px rgba(251, 146, 60, 0.1), 0 2px 4px -1px rgba(251, 146, 60, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.15), 0 4px 6px -2px rgba(251, 146, 60, 0.1);
    border-color: #fb923c;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 0.75rem;
    background: #fed7aa;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      font-size: 1.5rem;
      color: #c2410c;
    }

    &.warning svg { color: #f59e0b; }
    &.success svg { color: #10b981; }
    &.info svg { color: #3b82f6; }
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1c1917;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #78716c;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 0.25rem;
  }
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  font-weight: 500;

  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  button {
    margin-left: auto;
    background: transparent;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    
    &:hover { opacity: 1; }
  }
`;

const ContentSection = styled.section`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const SectionHeader = styled.div`
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.footer_bg} 0%, ${({ theme }) => theme.colors.btn} 100%);
  color: ${({ theme }) => theme.colors.white};

  .title-area {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .section-icon {
    font-size: 1.5rem;
    opacity: 0.9;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0.25rem 0 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid #e5e7eb;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f4;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  flex: 1;
  max-width: 400px;
  transition: all 0.3s ease;

  &:focus-within {
    background: white;
    border-color: #fb923c;
    box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
  }

  svg {
    color: #78716c;
    margin-right: 0.75rem;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #1c1917;

    &::placeholder {
      color: #a8a29e;
    }

    &:focus {
      outline: none;
    }
  }

  .clear-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #78716c;
    padding: 0.25rem;

    &:hover {
      color: #1c1917;
    }
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.btn};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(205, 133, 63, 0.3);

  &:hover {
    background: ${({ theme }) => theme.colors.helper};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(205, 133, 63, 0.4);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #78716c;

  svg {
    font-size: 3rem;
    opacity: 0.5;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    color: #44403c;
  }
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(251, 146, 60, 0.1);

  th, td {
    padding: 1rem 1.5rem;
    text-align: left;
    border-bottom: 1px solid #fed7aa;
  }

  th {
    background: #fef3c7;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #78716c;
  }

  tbody tr {
    transition: background 0.2s ease;

    &:hover {
      background: #fffbeb;
    }
  }
`;

const ProductThumbnail = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .name {
    font-weight: 600;
    color: #1c1917;
  }

  .id {
    font-size: 0.75rem;
    color: #a8a29e;
    font-family: monospace;
  }

  .featured-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.helper};
    font-weight: 600;
  }
`;

const PriceDisplay = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.heading};
  font-size: 1rem;
`;

const StockBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;

  &.in-stock {
    background: #d4edda;
    color: #155724;
  }

  &.low-stock {
    background: #fff3cd;
    color: #856404;
  }

  &.out-stock {
    background: #f8d7da;
    color: #721c24;
  }
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.heading};
  border-radius: 0.5rem;
  font-size: 0.85rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${({ status }) => {
    switch(status) {
      case 'delivered':
      case 'completed':
        return `
          background: rgba(46, 125, 50, 0.15);
          color: #2e7d32;
        `;
      case 'shipped':
      case 'processing':
        return `
          background: rgba(205, 133, 63, 0.2);
          color: #8B4513;
        `;
      case 'cancelled':
      case 'failed':
        return `
          background: rgba(211, 47, 47, 0.15);
          color: #d32f2f;
        `;
      default:
        return `
          background: rgba(255, 193, 7, 0.2);
          color: #f57c00;
        `;
    }
  }}
`;

const OrderStatusSelect = styled.select`
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  outline: none;
  transition: all 0.2s ease;
  
  ${({ status }) => {
    switch(status) {
      case 'delivered':
        return `
          background: rgba(46, 125, 50, 0.15);
          color: #2e7d32;
          border-color: #2e7d32;
        `;
      case 'shipped':
        return `
          background: rgba(33, 150, 243, 0.15);
          color: #1976d2;
          border-color: #1976d2;
        `;
      case 'processing':
        return `
          background: rgba(205, 133, 63, 0.2);
          color: #8B4513;
          border-color: #8B4513;
        `;
      case 'confirmed':
        return `
          background: rgba(76, 175, 80, 0.15);
          color: #388e3c;
          border-color: #388e3c;
        `;
      case 'cancelled':
        return `
          background: rgba(211, 47, 47, 0.15);
          color: #d32f2f;
          border-color: #d32f2f;
        `;
      default:
        return `
          background: rgba(255, 193, 7, 0.2);
          color: #f57c00;
          border-color: #f57c00;
        `;
    }
  }}
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(139, 69, 19, 0.2);
  }
`;

const OrderModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const OrderModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
    color: white;
    border-radius: 1rem 1rem 0 0;

    h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .modal-body {
    padding: 1.5rem;
  }

  .order-section {
    margin-bottom: 1.5rem;

    h4 {
      color: #8B4513;
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;

    .info-item {
      background: #f9f9f9;
      padding: 0.75rem;
      border-radius: 0.5rem;

      label {
        display: block;
        font-size: 0.75rem;
        color: #888;
        margin-bottom: 0.25rem;
      }

      span {
        font-weight: 500;
        color: #333;
      }
    }
  }

  .items-list {
    background: #f9f9f9;
    border-radius: 0.5rem;
    padding: 0.75rem;

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;

      &:last-child {
        border-bottom: none;
      }

      .item-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 0.25rem;
        }

        .item-name {
          font-weight: 500;
        }

        .item-qty {
          color: #888;
          font-size: 0.85rem;
        }
      }

      .item-price {
        font-weight: 600;
        color: #8B4513;
      }
    }
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: #FFF8DC;
    border-radius: 0.5rem;
    margin-top: 0.75rem;
    font-weight: 600;

    .total-amount {
      color: #8B4513;
      font-size: 1.1rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &.edit {
    background: ${({ theme }) => theme.colors.btn};
    color: ${({ theme }) => theme.colors.white};

    &:hover {
      background: ${({ theme }) => theme.colors.helper};
      transform: translateY(-2px);
    }
  }

  &.delete {
    background: #fee2e2;
    color: #dc2626;

    &:hover {
      background: #dc2626;
      color: white;
      transform: translateY(-2px);
    }
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 0.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  animation: modalSlideIn 0.2s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    max-width: 95%;
    border-radius: 0.375rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
  color: white;
  border-radius: 0;
  border-bottom: 1px solid #78350f;

  .modal-title {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon {
      font-size: 1.25rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.5rem;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    div {
      display: flex;
      flex-direction: column;
    }

    h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: white;
      letter-spacing: -0.01em;
    }

    p {
      margin: 0.25rem 0 0;
      opacity: 0.85;
      font-size: 0.8125rem;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 400;
    }
  }

  .close-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 0.375rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 1.125rem;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.35);
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 1.25rem 1.5rem;
    
    .modal-title {
      gap: 0.75rem;
      
      .icon {
        font-size: 1.125rem;
        padding: 0.4rem;
      }
      
      h2 {
        font-size: 1rem;
      }
      
      p {
        font-size: 0.75rem;
      }
    }
  }
`;

const ModalBody = styled.div`
  padding: 2rem;

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.full-width {
    width: 100%;
  }

  label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    letter-spacing: -0.01em;
    text-transform: capitalize;
  }

  input, select, textarea {
    padding: 0.625rem 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #111827;
    background: white;
    transition: all 0.15s ease;
    font-family: inherit;

    &::placeholder {
      color: #9ca3af;
    }

    &:hover {
      border-color: #9ca3af;
    }

    &:focus {
      outline: none;
      border-color: #92400e;
      box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.08);
    }
  }

  select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.625rem center;
    background-size: 1.125rem;
    padding-right: 2.25rem;
    font-weight: 500;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }

  .input-with-prefix {
    position: relative;
    display: flex;
    align-items: center;

    .prefix {
      position: absolute;
      left: 0.875rem;
      color: #6b7280;
      font-size: 0.9375rem;
      pointer-events: none;
    }

    input {
      padding-left: 2.5rem;
      width: 100%;
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadArea = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  padding: 1rem;
  background: #fafafa;
  transition: all 0.15s ease;

  &:focus-within {
    border-color: #92400e;
    background: white;
    box-shadow: 0 0 0 3px rgba(146, 64, 14, 0.08);
  }

  &:hover {
    border-color: #9ca3af;
    background: #fefefe;
  }

  input {
    width: 100%;
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
    font-size: 0.875rem;
    color: #111827;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  .hint {
    margin: 0.625rem 0 0;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 400;
  }
`;

const CheckboxRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  background: white;

  &:hover {
    border-color: #92400e;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    min-width: 18px;
    border: 1.5px solid #d1d5db;
    border-radius: 0.25rem;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    margin-top: 0.125rem;

    &::after {
      content: '✓';
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
      opacity: 0;
      transform: scale(0);
      transition: all 0.15s ease;
    }
  }

  input:checked ~ .checkmark {
    background: #92400e;
    border-color: #92400e;

    &::after {
      opacity: 1;
      transform: scale(1);
    }
  }

  input:checked ~ .label-content {
    svg {
      color: #92400e;
    }
  }

  .label-content {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    flex: 1;

    svg {
      color: #6b7280;
      font-size: 1.125rem;
      margin-top: 0.125rem;
      transition: color 0.15s ease;
    }

    div {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    strong {
      font-size: 0.875rem;
      color: #111827;
      font-weight: 600;
      display: block;
      line-height: 1.4;
    }

    small {
      font-size: 0.75rem;
      color: #6b7280;
      display: block;
      line-height: 1.4;
      font-weight: 400;
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 0.625rem 1.5rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: #92400e;
  color: white;
  border: 1px solid #78350f;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 140px;

  svg {
    font-size: 1rem;
  }

  &:hover:not(:disabled) {
    background: #78350f;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Delete Confirmation Modal Styles
const DeleteModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DeleteModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const DeleteIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #ff4757 0%, #e84118 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(232, 65, 24, 0.3);

  svg {
    font-size: 2.5rem;
    color: white;
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }
`;

const DeleteModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.heading};
  margin: 0 0 1rem;
`;

const DeleteModalMessage = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  margin: 0 0 2rem;

  strong {
    color: ${({ theme }) => theme.colors.heading};
    font-weight: 600;
  }
`;

const DeleteModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const DeleteCancelButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: white;
  color: ${({ theme }) => theme.colors.heading};
  border: 2px solid #e5e7eb;
  border-radius: 0.625rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const DeleteConfirmButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #ff4757 0%, #e84118 100%);
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(232, 65, 24, 0.3);

  svg {
    font-size: 1.1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(232, 65, 24, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default AdminProduct;
