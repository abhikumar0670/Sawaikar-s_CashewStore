import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import axios from "axios";
import toast from 'react-hot-toast';
import { useCartContext } from "./context/cart_context";
import { useWishlistContext } from "./context/wishlist_context";
import { useUser } from "@clerk/clerk-react";
import FormatPrice from "./Helpers/FormatPrice";

const Payment = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { cart, clearCart, total_price } = useCartContext();
  const { removeFromWishlist } = useWishlistContext();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Guest checkout state
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [guestFormErrors, setGuestFormErrors] = useState({});

  // Calculate order total with discounts (same logic as Cart.js)
  const calculateOriginalPrice = (price) => Math.ceil(price * 1.2);
  
  const subtotal = total_price;
  const totalOriginalPrice = cart.reduce((total, item) => {
    return total + (calculateOriginalPrice(item.price) * item.amount);
  }, 0);
  
  const dealOfTheDaySavings = totalOriginalPrice - subtotal;
  
  const getPromotionalDiscount = (amount) => {
    if (amount >= 3500) return { percentage: 20, label: "Premium Discount" };
    else if (amount >= 2500) return { percentage: 10, label: "Special Discount" };
    else if (amount >= 2000) return { percentage: 5, label: "Welcome Discount" };
    return { percentage: 0, label: "" };
  };
  
  const promotionalDiscount = getPromotionalDiscount(subtotal);
  const promotionalDiscountAmount = (subtotal * promotionalDiscount.percentage) / 100;
  
  // Check for applied coupon from localStorage (dynamic coupon from Cart)
  const savedCoupon = localStorage.getItem('appliedCoupon');
  const appliedCoupon = savedCoupon ? JSON.parse(savedCoupon) : null;
  const couponApplied = appliedCoupon !== null;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0; // Already in paise
  const couponCode = appliedCoupon ? appliedCoupon.code : '';
  
  const dynamicShippingFee = subtotal >= 2000 ? 0 : 150;
  
  // Final total in paise
  const finalTotalPaise = subtotal - dealOfTheDaySavings - promotionalDiscountAmount - couponDiscount + dynamicShippingFee;
  const finalTotalRupees = finalTotalPaise / 100; // Convert to rupees for Razorpay

  // Load Razorpay SDK script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          console.log('✅ Razorpay SDK loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().then(setRazorpayLoaded);
  }, []);

  // Get user details helper functions (support guest checkout)
  const getClerkId = () => isGuestCheckout ? `guest-${Date.now()}` : (user?.id || '');
  const getUserEmail = () => {
    if (isGuestCheckout) return guestInfo.email || 'guest@example.com';
    if (!user) return 'customer@example.com';
    return user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || 'customer@example.com';
  };
  const getUserName = () => {
    if (isGuestCheckout) return guestInfo.name || 'Guest Customer';
    if (!user) return 'Customer';
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer';
  };
  const getUserPhone = () => {
    if (isGuestCheckout) return guestInfo.phone || '';
    return user?.phoneNumbers?.[0]?.phoneNumber || '';
  };
  const getShippingAddress = () => {
    if (isGuestCheckout) {
      return {
        name: guestInfo.name,
        address: guestInfo.address,
        city: guestInfo.city,
        state: guestInfo.state,
        pincode: guestInfo.pincode,
        phone: guestInfo.phone
      };
    }
    return null;
  };

  // Validate guest form
  const validateGuestForm = () => {
    const errors = {};
    if (!guestInfo.name.trim()) errors.name = 'Name is required';
    if (!guestInfo.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) errors.email = 'Invalid email format';
    if (!guestInfo.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(guestInfo.phone.replace(/\D/g, ''))) errors.phone = 'Enter 10-digit phone number';
    if (!guestInfo.address.trim()) errors.address = 'Address is required';
    if (!guestInfo.city.trim()) errors.city = 'City is required';
    if (!guestInfo.state.trim()) errors.state = 'State is required';
    if (!guestInfo.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(guestInfo.pincode)) errors.pincode = 'Enter 6-digit pincode';
    
    setGuestFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle guest form input change
  const handleGuestInputChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
    if (guestFormErrors[name]) {
      setGuestFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Helper to remove checked out items from wishlist
  const removeCheckedOutFromWishlist = (cartItems) => {
    if (Array.isArray(cartItems)) {
      cartItems.forEach(item => {
        const baseId = typeof item.id === 'string' ? item.id.replace(/#.+$/, '') : item.id;
        removeFromWishlist(baseId);
      });
    }
  };

  // Handle Razorpay Payment
  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system is still loading. Please wait a moment and try again.', {
        duration: 4000,
        position: 'top-center'
      });
      return;
    }

    // Check if user is signed in OR using guest checkout
    if (!isSignedIn && !isGuestCheckout) {
      toast.error('Please sign in or continue as guest to complete your purchase.', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    // Validate guest form if using guest checkout
    if (isGuestCheckout && !validateGuestForm()) {
      toast.error('Please fill in all required fields correctly.', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.', {
        duration: 3000,
        position: 'top-center'
      });
      navigate('/products');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order on backend
      console.log('🔄 Creating Razorpay order for amount:', finalTotalRupees);
      
      const orderResponse = await axios.post('http://localhost:5000/api/payment/create-order', {
        amount: finalTotalRupees
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, currency, amount, keyId } = orderResponse.data;
      console.log('✅ Razorpay Order Created:', orderId);

      // Step 2: Initialize Razorpay Checkout
      const options = {
        key: keyId, // Your Razorpay Key ID from backend
        amount: amount, // Amount in paise
        currency: currency,
        name: "Sawaikar's Cashew Store",
        description: 'Premium Cashew Products',
        order_id: orderId,
        handler: async function (response) {
          // Step 3: Payment Success Handler
          console.log('✅ Payment Successful!', response);
          
          // Show loading toast
          const loadingToast = toast.loading('Verifying payment and creating your order...', {
            position: 'top-center'
          });
          
          try {
            // Prepare order data
            const orderItems = cart.map(item => {
              let imageStr = '';
              if (typeof item.image === 'string') {
                imageStr = item.image;
              } else if (Array.isArray(item.image) && item.image.length > 0) {
                imageStr = typeof item.image[0] === 'string' ? item.image[0] : (item.image[0]?.url || '');
              } else if (item.image && typeof item.image === 'object' && item.image.url) {
                imageStr = item.image.url;
              }

              return {
                productId: item.id,
                name: item.name || 'Product',
                price: item.price || 0,
                quantity: item.amount || 1,
                color: item.color || '',
                image: imageStr
              };
            });

            // Get shipping address (from guest form or default)
            const shippingAddr = isGuestCheckout ? getShippingAddress() : {
              name: getUserName(),
              street: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              zipCode: '400001',
              country: 'India'
            };

            // CRITICAL: Ensure all required fields are sent
            const orderData = {
              user: {
                clerkId: getClerkId(),
                email: getUserEmail(),
                name: getUserName()
              },
              items: orderItems,
              totalAmount: finalTotalPaise, // Store in paise for consistency
              shippingAddress: {
                name: shippingAddr.name || getUserName(),
                street: shippingAddr.address || shippingAddr.street || '',
                address: shippingAddr.address || shippingAddr.street || '',
                city: shippingAddr.city || '',
                state: shippingAddr.state || '',
                pincode: shippingAddr.pincode || '',
                zipCode: shippingAddr.pincode || shippingAddr.zipCode || '',
                phone: isGuestCheckout ? guestInfo.phone : '',
                country: 'India'
              },
              isGuestOrder: isGuestCheckout,
              userPhone: getUserPhone()
            };

            console.log('📤 Sending order data to backend:', orderData);

            // Verify payment and save order on backend (CRITICAL STEP)
            const verifyResponse = await axios.post('http://localhost:5000/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData
            });

            console.log('📥 Backend response:', verifyResponse.data);

            if (verifyResponse.data.success) {
              console.log('✅ Order saved to MongoDB:', verifyResponse.data.orderId);

              // Mark coupon as used if one was applied
              if (couponApplied && couponCode) {
                try {
                  await axios.post('http://localhost:5000/api/coupons/apply', {
                    code: couponCode,
                    userEmail: getUserEmail(),
                    orderAmount: finalTotalPaise / 100 // Send in rupees
                  });
                  console.log('✅ Coupon usage recorded:', couponCode);
                } catch (couponError) {
                  console.warn('⚠️ Failed to record coupon usage:', couponError);
                  // Don't fail the order if coupon update fails
                }
              }

              // Dismiss loading toast and show success
              toast.dismiss(loadingToast);
              toast.success('Order placed successfully! 🎉', {
                duration: 3000,
                position: 'top-center'
              });

              // Clear cart and wishlist (frontend state)
              removeCheckedOutFromWishlist(cart);
              clearCart();
              
              // Clear coupon from localStorage
              localStorage.removeItem('appliedCoupon');

              // Redirect to Order Success page with payment details
              navigate('/order-success', {
                state: {
                  paymentId: response.razorpay_payment_id,
                  orderId: verifyResponse.data.orderId,
                  amount: finalTotalRupees
                }
              });
            } else {
              throw new Error(verifyResponse.data.error || 'Payment verification failed on server');
            }
          } catch (error) {
            console.error('❌ Error processing payment:', error);
            console.error('Error details:', error.response?.data);
            
            // Dismiss loading toast and show error
            toast.dismiss(loadingToast);
            toast.error(
              `Payment verified, but order creation failed.\n\nPayment ID: ${response.razorpay_payment_id}\n\nPlease contact support with this Payment ID.`,
              {
                duration: 8000,
                position: 'top-center',
                style: {
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '500',
                  padding: '16px',
                  borderRadius: '8px'
                }
              }
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: getUserName(),
          email: getUserEmail(),
          contact: '9999999999'
        },
        notes: {
          address: "Sawaikar's Cashew Store, Mumbai"
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ Payment cancelled by user');
            setIsProcessing(false);
            toast('Payment was cancelled. Your cart is still saved.', {
              icon: '⚠️',
              duration: 3000,
              position: 'top-center'
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', async function (response) {
        console.error('❌ Payment Failed:', response.error);
        
        setIsProcessing(false);
        toast.error(
          `Payment Failed!\n\nReason: ${response.error.description}\n\nPlease try again.`,
          {
            duration: 6000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '500'
            }
          }
        );
      });

      razorpay.open();

    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      setIsProcessing(false);
      toast.error('Failed to initiate payment. Please check your connection and try again.', {
        duration: 4000,
        position: 'top-center'
      });
    }
  };

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <Wrapper>
        <div className="container">
          <EmptyCartMessage>
            <h2>Your cart is empty</h2>
            <p>Add some delicious cashews to your cart to proceed with payment.</p>
            <button className="btn-shop" onClick={() => navigate('/products')}>
              Shop Now
            </button>
          </EmptyCartMessage>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="container">
        <div className="payment-card">
          <h1 className="page-title">Order Summary</h1>
          
          {/* Order Review Section */}
          <div className="order-review">
            
            <div className="summary-details">
              <div className="detail-row">
                <span className="detail-label">Total Items:</span>
                <span className="detail-value">{cart.length}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Item Subtotal:</span>
                <span className="detail-value"><FormatPrice price={subtotal} /></span>
              </div>
              
              {dealOfTheDaySavings > 0 && (
                <div className="detail-row savings">
                  <span className="detail-label">Deal Savings:</span>
                  <span className="detail-value negative">-<FormatPrice price={dealOfTheDaySavings} /></span>
                </div>
              )}
              
              {promotionalDiscount.percentage > 0 && (
                <div className="detail-row discount">
                  <span className="detail-label">Discount ({promotionalDiscount.percentage}%):</span>
                  <span className="detail-value negative">-<FormatPrice price={promotionalDiscountAmount} /></span>
                </div>
              )}
              
              {couponApplied && couponDiscount > 0 && (
                <div className="detail-row coupon">
                  <span className="detail-label">Coupon ({couponCode}):</span>
                  <span className="detail-value negative">-<FormatPrice price={couponDiscount} /></span>
                </div>
              )}
              
              <div className="detail-row shipping">
                <span className="detail-label">Shipping:</span>
                <span className="detail-value">
                  {dynamicShippingFee === 0 ? (
                    <span className="free-shipping">FREE 🚚</span>
                  ) : (
                    <FormatPrice price={dynamicShippingFee} />
                  )}
                </span>
              </div>
              
              <hr className="divider" />
              
              <div className="detail-row total">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value total-amount"><FormatPrice price={finalTotalPaise} /></span>
              </div>
            </div>

            {/* Guest Checkout Option */}
            {!isSignedIn && (
              <div className="guest-checkout-section">
                <div className="checkout-toggle">
                  <button 
                    className={`toggle-btn ${!isGuestCheckout ? 'active' : ''}`}
                    onClick={() => { setIsGuestCheckout(false); navigate('/login'); }}
                  >
                    🔐 Sign In to Checkout
                  </button>
                  <button 
                    className={`toggle-btn ${isGuestCheckout ? 'active' : ''}`}
                    onClick={() => setIsGuestCheckout(true)}
                  >
                    👤 Continue as Guest
                  </button>
                </div>

                {isGuestCheckout && (
                  <div className="guest-form">
                    <h3>📦 Shipping Details</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={guestInfo.name}
                          onChange={handleGuestInputChange}
                          placeholder="Enter your full name"
                          className={guestFormErrors.name ? 'error' : ''}
                        />
                        {guestFormErrors.name && <span className="error-text">{guestFormErrors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={guestInfo.email}
                          onChange={handleGuestInputChange}
                          placeholder="your@email.com"
                          className={guestFormErrors.email ? 'error' : ''}
                        />
                        {guestFormErrors.email && <span className="error-text">{guestFormErrors.email}</span>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={guestInfo.phone}
                          onChange={handleGuestInputChange}
                          placeholder="10-digit phone number"
                          className={guestFormErrors.phone ? 'error' : ''}
                        />
                        {guestFormErrors.phone && <span className="error-text">{guestFormErrors.phone}</span>}
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={guestInfo.address}
                        onChange={handleGuestInputChange}
                        placeholder="House/Flat No., Street, Area"
                        className={guestFormErrors.address ? 'error' : ''}
                      />
                      {guestFormErrors.address && <span className="error-text">{guestFormErrors.address}</span>}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={guestInfo.city}
                          onChange={handleGuestInputChange}
                          placeholder="City"
                          className={guestFormErrors.city ? 'error' : ''}
                        />
                        {guestFormErrors.city && <span className="error-text">{guestFormErrors.city}</span>}
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={guestInfo.state}
                          onChange={handleGuestInputChange}
                          placeholder="State"
                          className={guestFormErrors.state ? 'error' : ''}
                        />
                        {guestFormErrors.state && <span className="error-text">{guestFormErrors.state}</span>}
                      </div>
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={guestInfo.pincode}
                          onChange={handleGuestInputChange}
                          placeholder="6-digit pincode"
                          className={guestFormErrors.pincode ? 'error' : ''}
                        />
                        {guestFormErrors.pincode && <span className="error-text">{guestFormErrors.pincode}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pay Now Button */}
            <button 
              className="pay-button"
              onClick={handlePayment}
              disabled={isProcessing || !razorpayLoaded}
            >
              {isProcessing ? 'PROCESSING...' : !razorpayLoaded ? 'LOADING...' : `PAY ₹${(finalTotalPaise / 100).toFixed(2)} NOW`}
            </button>

            {/* Security Badge */}
            <div className="security-badge">
              <span>🔒 100% Secure Payment via Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 9rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .payment-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    padding: 3.5rem;
  }

  .page-title {
    font-size: 3rem;
    font-weight: 700;
    color: #2d2d2d;
    margin: 0 0 3rem 0;
    text-align: center;
  }

  .order-review {
    .summary-details {
      margin-bottom: 3rem;

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.2rem 0;
        font-size: 1.6rem;

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #2d2d2d;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        &.savings, &.discount, &.coupon {
          .negative {
            color: #10b981;
            font-weight: 700;
          }
        }

        &.shipping {
          .free-shipping {
            color: #10b981;
            font-weight: 700;
            font-size: 1.6rem;
          }
        }

        &.total {
          margin-top: 1rem;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea15, #764ba215);
          border-radius: 12px;

          .detail-label {
            font-size: 1.8rem;
            color: #2d2d2d;
            font-weight: 700;
          }

          .total-amount {
            font-size: 2.4rem;
            color: #667eea;
            font-weight: 800;
          }
        }
      }

      .divider {
        border: none;
        border-top: 2px dashed #e5e7eb;
        margin: 1.5rem 0;
      }
    }

    .pay-button {
      width: 100%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 2rem 3rem;
      font-size: 2rem;
      font-weight: 800;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #5a67d8, #6b46c1);
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
      }

      &:active:not(:disabled) {
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .security-badge {
      text-align: center;
      margin-top: 2rem;
      font-size: 1.4rem;
      color: #6b7280;
      font-weight: 600;
    }
  }

  /* Guest Checkout Styles */
  .guest-checkout-section {
    margin-bottom: 2rem;
    padding: 2rem;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;

    .checkout-toggle {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;

      .toggle-btn {
        flex: 1;
        padding: 1.2rem 1.5rem;
        font-size: 1.4rem;
        font-weight: 600;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #667eea;
        }

        &.active {
          background: linear-gradient(135deg, #667eea15, #764ba215);
          border-color: #667eea;
          color: #667eea;
        }
      }
    }

    .guest-form {
      h3 {
        font-size: 1.8rem;
        color: #2d2d2d;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .form-group {
        margin-bottom: 0.5rem;

        &.full-width {
          grid-column: 1 / -1;
          margin-bottom: 1rem;
        }

        label {
          display: block;
          font-size: 1.3rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        input {
          width: 100%;
          padding: 1rem 1.2rem;
          font-size: 1.4rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          &.error {
            border-color: #ef4444;
          }

          &::placeholder {
            color: #9ca3af;
          }
        }

        .error-text {
          display: block;
          font-size: 1.2rem;
          color: #ef4444;
          margin-top: 0.4rem;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 6rem 0;

    .container {
      padding: 0 1rem;
    }

    .payment-card {
      padding: 2.5rem;
      border-radius: 16px;
    }

    .page-title {
      font-size: 2.4rem;
      margin-bottom: 2.5rem;
    }

    .order-review {
      .summary-details {
        .detail-row {
          font-size: 1.4rem;
          padding: 1rem 0;

          &.total {
            padding: 1.5rem;

            .detail-label {
              font-size: 1.6rem;
            }

            .total-amount {
              font-size: 2rem;
            }
          }
        }
      }

      .pay-button {
        padding: 1.7rem 2rem;
        font-size: 1.7rem;
      }

      .security-badge {
        font-size: 1.2rem;
      }
    }
  }
`;

const EmptyCartMessage = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

  h2 {
    font-size: 2.8rem;
    color: #2d2d2d;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }

  p {
    font-size: 1.7rem;
    color: #6b7280;
    margin-bottom: 3rem;
  }

  .btn-shop {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1.5rem 4rem;
    font-size: 1.7rem;
    font-weight: 700;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      background: linear-gradient(135deg, #5a67d8, #6b46c1);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }
`;

export default Payment;
