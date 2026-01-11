import styled from "styled-components";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCartContext } from "./context/cart_context";
import CartItem from "./components/CartItem";
import { NavLink } from "react-router-dom";
import { Button } from "./styles/Button";
import FormatPrice from "./Helpers/FormatPrice";
import { useAuth } from "./context/auth_context";
import emptyCartGif from "./assets/cartGif.gif";
import { FiX, FiCreditCard, FiTag, FiGift, FiCheck } from "react-icons/fi";

// API Base URL for production
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const Cart = () => {
//   const { cart, clearCart, total_price, shipping_fee } = useCartContext();
//   // console.log("🚀 ~ file: Cart.js ~ line 6 ~ Cart ~ cart", cart);

//   const { isAuthenticated, user } = useAuth0();

//   if (cart.length === 0) {
//     return (
//       <EmptyDiv>
//         <h3>No Cart in Item </h3>
//       </EmptyDiv>
//     );
//   }


const Cart = () => {
  const { cart, clearCart, total_price, shipping_fee } = useCartContext();
  const { isAuthenticated, user } = useAuth();
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showBankTC, setShowBankTC] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showKnowMoreModal, setShowKnowMoreModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Load coupon state from localStorage on mount
  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      const { code, discount } = JSON.parse(savedCoupon);
      setCouponApplied(true);
      setCouponDiscount(discount);
      setAppliedCouponCode(code);
    }
    
    // Fetch available coupons
    axios.get(`${API_URL}/coupons`)
      .then(response => {
        const activeCoupons = response.data.filter(c => c.isActive && new Date(c.expiryDate) > new Date());
        setAvailableCoupons(activeCoupons.slice(0, 3)); // Show max 3 coupons
      })
      .catch(err => console.log('Could not fetch coupons'));
  }, []);

  // Scroll lock effect
  useEffect(() => {
    if (showOffersModal || showKnowMoreModal) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      // Unlock scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showOffersModal, showKnowMoreModal]);

  const handleApplyCoupon = async (code = couponCode) => {
    if (!code.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setCouponLoading(true);
    setCouponError("");
    
    try {
      // Convert subtotal from paise to rupees for API
      const orderAmountRupees = subtotal / 100;
      
      const response = await axios.post(`${API_URL}/coupons/validate`, {
        code: code.toUpperCase(),
        userEmail: user?.email,
        orderAmount: orderAmountRupees
      });
      
      if (response.data.valid) {
        // Discount is in rupees, convert to paise
        const discountInPaise = response.data.coupon.discount * 100;
        
        setCouponApplied(true);
        setCouponDiscount(discountInPaise);
        setAppliedCouponCode(response.data.coupon.code);
        setCouponCode("");
        
        // Save to localStorage
        localStorage.setItem('appliedCoupon', JSON.stringify({
          code: response.data.coupon.code,
          discount: discountInPaise
        }));
        
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setAppliedCouponCode("");
    localStorage.removeItem('appliedCoupon');
  };

  // Do NOT clear coupon when proceeding to pay - Payment page will use it and clear after order success
  const handleProceedToPay = () => {
    // Coupon will be cleared in Payment.js after successful order
    // This allows the discount to carry over to the payment page
  };

  // Calculate MRP (original prices) and Deal of the Day savings
  const calculateOriginalPrice = (price) => Math.ceil(price * 1.2);
  
  const subtotal = total_price;
  const totalOriginalPrice = cart.reduce((total, item) => {
    return total + (calculateOriginalPrice(item.price) * item.amount);
  }, 0);
  
  // Deal of the Day savings (difference between MRP and current price)
  const dealOfTheDaySavings = totalOriginalPrice - subtotal;
  
  // Promotional discount logic based on cart value (applied on subtotal)
  const getPromotionalDiscount = (amount) => {
    if (amount >= 3500) {
      return { percentage: 20, label: "Premium Discount" };
    } else if (amount >= 2500) {
      return { percentage: 10, label: "Special Discount" };
    } else if (amount >= 2000) {
      return { percentage: 5, label: "Welcome Discount" };
    }
    return { percentage: 0, label: "" };
  };
  
  const promotionalDiscount = getPromotionalDiscount(subtotal);
  const promotionalDiscountAmount = (subtotal * promotionalDiscount.percentage) / 100;
  
  // Total savings = Deal of the Day + Promotional Discount
  const totalSavings = dealOfTheDaySavings + promotionalDiscountAmount;
  
  // Shipping fee logic
  const dynamicShippingFee = subtotal >= 2000 ? 0 : 150;
  
  // Final total calculation: Start with subtotal, subtract all discounts (deal savings, promotional discount, and coupon), add shipping
  const finalTotal = subtotal - dealOfTheDaySavings - promotionalDiscountAmount - couponDiscount + dynamicShippingFee;

  if (cart.length === 0) {
    return (
      <EmptyCartWrapper>
        <img src={emptyCartGif} alt="Empty Cart" />
        <h3>Your Cart is Empty</h3>
        <NavLink to="/products">
          <Button>Continue Shopping</Button>
        </NavLink>
      </EmptyCartWrapper>
    );
  }

  return (
    <Wrapper>
      <div className="container">
        <div className="cart-card">
          <div className="cart-header">
            <h1 className="cart-title">Shopping Cart</h1>
            {isAuthenticated && (
              <div className="cart-user--profile">
                <img src={user.picture} alt={user.name} />
                <span className="cart-user--name">{user.name}</span>
              </div>
            )}
          </div>

          <div className="cart_heading grid grid-five-column">
            <p>Item</p>
            <p className="cart-hide">Price</p>
            <p>Quantity</p>
            <p className="cart-hide">Subtotal</p>
            <p>Remove</p>
          </div>
          
          <div className="cart-item">
            {cart.map((curElem) => {
              return <CartItem key={curElem.id} {...curElem} />;
            })}
          </div>
          
          <div className="cart-footer">
            <NavLink to="/products">
              <button className="btn-continue">CONTINUE SHOPPING</button>
            </NavLink>
            <button className="btn-clear" onClick={clearCart}>
              CLEAR CART
            </button>
          </div>
        </div>

        {/* Two Column Layout: Savings + Order Summary */}
        <div className="checkout-container">
          {/* Left Column - Your Total Savings */}
          <div className="savings-summary-card">
            <h2 className="savings-title">Your Total Savings</h2>
            
            {/* Deal of the Day Banner */}
            {dealOfTheDaySavings > 0 && (
              <div className="deal-banner">
                <div className="deal-content">
                  <span className="deal-icon">🎉</span>
                  <div className="deal-text">
                    <h3>Deal of the Day!</h3>
                    <p>Special discounts on all items - You're saving <strong><FormatPrice price={dealOfTheDaySavings} /></strong> from MRP!</p>
                  </div>
                </div>
                <div className="deal-amount">
                  <FormatPrice price={dealOfTheDaySavings} />
                </div>
              </div>
            )}
            
            {/* Premium Discount Banner */}
            {promotionalDiscount.percentage > 0 && (
              <div className="premium-banner">
                <div className="premium-content">
                  <span className="premium-icon">🎫</span>
                  <div className="premium-text">
                    <h3>{promotionalDiscount.label} Applied!</h3>
                    <p>{promotionalDiscount.percentage}% OFF on your cart value</p>
                  </div>
                </div>
                <div className="premium-amount">
                  -<FormatPrice price={promotionalDiscountAmount} />
                </div>
              </div>
            )}
            
            {/* Unlock More Savings */}
            <div className="unlock-savings">
              <div className="unlock-content">
                <span className="unlock-icon">🚀</span>
                <span className="unlock-text">Unlock More Savings!</span>
              </div>
              <button className="view-offers-btn" onClick={() => setShowOffersModal(true)}>
                VIEW OFFERS
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary-card">
            <div className="price-breakdown">
              <div className="price-row">
                <p>Item Subtotal:</p>
                <p><FormatPrice price={subtotal} /></p>
              </div>
              
              {dealOfTheDaySavings > 0 && (
                <div className="price-row savings">
                  <p>Deal of the Day Savings:</p>
                  <p className="negative">-<FormatPrice price={dealOfTheDaySavings} /></p>
                </div>
              )}
              
              {promotionalDiscount.percentage > 0 && (
                <div className="price-row discount">
                  <p>Premium Discount ({promotionalDiscount.percentage}%):</p>
                  <p className="negative">-<FormatPrice price={promotionalDiscountAmount} /></p>
                </div>
              )}
              
              {couponApplied && couponDiscount > 0 && (
                <div className="price-row coupon">
                  <p>Coupon (<strong>{appliedCouponCode}</strong>): <button onClick={handleRemoveCoupon} style={{background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '0.5rem'}}>Remove</button></p>
                  <p className="negative coupon-amount">-<FormatPrice price={couponDiscount} /></p>
                </div>
              )}
              
              <div className="price-row shipping">
                <p>Shipping Fee:</p>
                <p className={dynamicShippingFee === 0 ? "free" : ""}>
                  {dynamicShippingFee === 0 ? (
                    <span className="free-shipping">FREE 🚚</span>
                  ) : (
                    <FormatPrice price={dynamicShippingFee} />
                  )}
                </p>
              </div>
              
              <hr className="total-divider" />
              
              <div className="price-row final-total">
                <p>Order Total:</p>
                <p><FormatPrice price={finalTotal} /></p>
              </div>
              
              {subtotal >= 2000 && (
                <div className="free-delivery-badge">
                  <span>🎉 FREE Delivery Applied!</span>
                </div>
              )}
            </div>

            {/* Proceed to Pay Button inside Order Summary */}
            <NavLink to="/payment" className="payment-link" onClick={handleProceedToPay}>
              <button className="proceed-to-pay-btn">PROCEED TO PAY</button>
            </NavLink>
          </div>
        </div>

        {/* Offers Modal */}
        {showOffersModal && (
          <OffersModalOverlay onClick={() => setShowOffersModal(false)}>
            <OffersModal onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Available Offers</h2>
                <button className="close-btn" onClick={() => setShowOffersModal(false)}>
                  <FiX />
                </button>
              </div>

              <div className="offers-list">
                {/* Bank Offer */}
                <div className="offer-card">
                  <div className="offer-icon">
                    <FiCreditCard />
                  </div>
                  <div className="offer-content">
                    <h3>10% Instant Discount on SBI Credit Cards</h3>
                    <p>Min. purchase value ₹2,500. Max discount ₹750.</p>
                    {showBankTC && (
                      <div className="tc-content">
                        <ul>
                          <li>• Offer valid once per user.</li>
                          <li>• Not applicable on EMI transactions.</li>
                          <li>• Cannot be combined with other offers.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <button 
                    className="offer-link" 
                    onClick={() => setShowBankTC(!showBankTC)}
                  >
                    {showBankTC ? "Close T&C" : "T&C Apply"}
                  </button>
                </div>

                <div className="offer-divider"></div>

                {/* Coupon Code Input */}
                <div className="offer-card coupon-input-card">
                  <div className="offer-icon">
                    <FiTag />
                  </div>
                  <div className="offer-content" style={{ flex: 1 }}>
                    <h3>Have a Coupon Code?</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: couponError ? '1px solid #dc2626' : '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          flex: 1,
                          textTransform: 'uppercase'
                        }}
                        disabled={couponApplied}
                      />
                      {!couponApplied && (
                        <button 
                          className="apply-btn" 
                          onClick={() => handleApplyCoupon()}
                          disabled={couponLoading}
                          style={{ minWidth: '80px' }}
                        >
                          {couponLoading ? '...' : 'APPLY'}
                        </button>
                      )}
                    </div>
                    {couponError && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>{couponError}</p>}
                    {couponApplied && (
                      <p style={{ color: '#16a34a', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        ✓ Coupon {appliedCouponCode} applied! Saving <FormatPrice price={couponDiscount} />
                      </p>
                    )}
                  </div>
                </div>

                {/* Available Coupons */}
                {availableCoupons.length > 0 && !couponApplied && (
                  <>
                    <div className="offer-divider"></div>
                    <div style={{ padding: '0 0.5rem' }}>
                      <h4 style={{ color: '#374151', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Available Coupons</h4>
                      {availableCoupons.map((coupon) => (
                        <div key={coupon._id} className={`offer-card`} style={{ marginBottom: '0.5rem' }}>
                          <div className="offer-icon" style={{ background: '#dcfce7' }}>
                            <FiTag style={{ color: '#16a34a' }} />
                          </div>
                          <div className="offer-content">
                            <h3 style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{coupon.code}</h3>
                            <p>{coupon.description}</p>
                            {coupon.minOrderValue > 0 && (
                              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Min order: ₹{coupon.minOrderValue}</p>
                            )}
                          </div>
                          <button 
                            className="apply-btn" 
                            onClick={() => handleApplyCoupon(coupon.code)}
                            disabled={couponLoading}
                          >
                            APPLY
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="offer-divider"></div>

                {/* Partner Offer */}
                <div className="offer-card">
                  <div className="offer-icon">
                    <FiGift />
                  </div>
                  <div className="offer-content">
                    <h3>Free Movie Voucher worth ₹250</h3>
                    <p>Valid on purchase of Flavored Cashews combo packs.</p>
                  </div>
                  <button 
                    className="offer-link" 
                    onClick={() => setShowKnowMoreModal(true)}
                  >
                    Know More
                  </button>
                </div>
              </div>

              {/* Success Toast */}
              {showSuccessToast && (
                <SuccessToast>
                  <FiCheck />
                  <span>Success! Coupon {appliedCouponCode} applied. You saved <FormatPrice price={couponDiscount} /></span>
                </SuccessToast>
              )}
            </OffersModal>
          </OffersModalOverlay>
        )}

        {/* Know More Secondary Modal */}
        {showKnowMoreModal && (
          <SecondaryModalOverlay onClick={() => setShowKnowMoreModal(false)}>
            <SecondaryModal onClick={(e) => e.stopPropagation()}>
              <div className="secondary-header">
                <h3>Movie Voucher Details</h3>
                <button className="close-btn" onClick={() => setShowKnowMoreModal(false)}>
                  <FiX />
                </button>
              </div>
              <div className="secondary-content">
                <p>
                  This voucher is redeemable at partner cinemas for one ticket. 
                  Valid for 3 months from the date of purchase. A unique code will 
                  be sent via email after order delivery.
                </p>
              </div>
              <button 
                className="ok-btn" 
                onClick={() => setShowKnowMoreModal(false)}
              >
                OK, GOT IT
              </button>
            </SecondaryModal>
          </SecondaryModalOverlay>
        )}
      </div>
    </Wrapper>
  );
};

// const EmptyDiv = styled.div`
//   display: grid;
//   place-items: center;
//   height: 50vh;

//   h3 {
//     font-size: 4.2rem;
//     text-transform: capitalize;
//     font-weight: 300;
//   }
// `;


const EmptyCartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  text-align: center;

  img {
    width: 300px;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 2rem;
    font-weight: 400;
    margin-bottom: 1rem;
    text-transform: capitalize;
  }

  a {
    text-decoration: none;
  }
`;

const Wrapper = styled.section`
  padding: 9rem 0;
  background: #fff8e7;
  min-height: 100vh;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .cart-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    padding: 3rem;
    margin-bottom: 3rem;
  }

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid #f0f0f0;
  }

  .cart-title {
    font-size: 2.4rem;
    font-weight: 700;
    color: #4a4a4a;
    margin: 0;
    text-transform: capitalize;
  }

  .cart-user--profile {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #f0f0f0;
    }

    .cart-user--name {
      font-size: 1.6rem;
      font-weight: 600;
      color: #4a4a4a;
      text-transform: capitalize;
    }
  }

  .grid-five-column {
    display: grid;
    grid-template-columns: 2fr 1fr 1.2fr 1fr 0.5fr;
    gap: 2rem;
    align-items: center;
    text-align: left;
  }

  .cart_heading {
    padding: 1.5rem 0;
    border-bottom: 2px solid #f0f0f0;
    margin-bottom: 2rem;

    p {
      font-size: 1.4rem;
      font-weight: 600;
      color: #4a4a4a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
  }

  .cart-item {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 2rem;
  }

  .cart-image--name {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    text-align: left;

    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
    }

    div {
      p {
        font-size: 1.5rem;
        font-weight: 500;
        color: #2d2d2d;
        margin: 0;
        line-height: 1.4;
      }
    }
  }

  .remove_icon {
    font-size: 2rem;
    color: #ef4444;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.5rem;

    &:hover {
      color: #dc2626;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 2px solid #f0f0f0;
    gap: 2rem;

    a {
      text-decoration: none;
    }

    button {
      padding: 1.2rem 2.5rem;
      font-size: 1.4rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;
      border: none;
    }

    .btn-continue {
      background: white;
      color: #d97706;
      border: 2px solid #d97706;

      &:hover {
        background: #d97706;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
      }
    }

    .btn-clear {
      background: #ef4444;
      color: white;

      &:hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }
    }
  }

  /* Two Column Layout Container */
  .checkout-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-top: 3rem;
  }

  /* Order Savings Summary Card (Left Column) */
  .savings-summary-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    padding: 3rem;
    height: fit-content;
  }

  .savings-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: #4a4a4a;
    margin: 0 0 2.5rem 0;
    text-align: center;
  }

  .deal-banner {
    background: linear-gradient(135deg, #ef4444, #fb923c);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

    .deal-content {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      flex: 1;

      .deal-icon {
        font-size: 2.4rem;
        line-height: 1;
      }

      .deal-text {
        h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.5rem 0;
        }

        p {
          font-size: 1.3rem;
          color: white;
          margin: 0;
          opacity: 0.95;
        }
      }
    }

    .deal-amount {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      white-space: nowrap;
      margin-left: 1rem;
    }
  }

  .premium-banner {
    background: #10b981;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

    .premium-content {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      flex: 1;

      .premium-icon {
        font-size: 2.4rem;
        line-height: 1;
      }

      .premium-text {
        h3 {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.5rem 0;
        }

        p {
          font-size: 1.3rem;
          color: white;
          margin: 0;
          opacity: 0.95;
        }
      }
    }

    .premium-amount {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      white-space: nowrap;
      margin-left: 1rem;
    }
  }

  .unlock-savings {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.8rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .unlock-content {
      display: flex;
      align-items: center;
      gap: 1.2rem;

      .unlock-icon {
        font-size: 2.2rem;
        line-height: 1;
      }

      .unlock-text {
        font-size: 1.6rem;
        font-weight: 600;
        color: #4a4a4a;
      }
    }

    .view-offers-btn {
      padding: 1rem 2rem;
      font-size: 1.4rem;
      font-weight: 600;
      color: #d97706;
      background: white;
      border: 2px solid #d97706;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;

      &:hover {
        background: #d97706;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  /* Order Summary Card (Right Column) */
  .order-summary-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    padding: 3rem;
    height: fit-content;
    display: flex;
    flex-direction: column;
  }

  .price-breakdown {
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      font-size: 1.5rem;
      color: #4a4a4a;
      
      p {
        margin: 0;
        
        &:last-child {
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
      }

      &.savings, &.discount {
        .negative {
          color: #10b981;
          font-weight: 600;
        }
      }
      
      &.coupon {
        .negative.coupon-amount {
          color: #10b981;
          font-weight: 700;
        }
      }
      
      &.shipping {
        .free-shipping {
          color: #10b981;
          font-weight: 600;
          font-size: 1.5rem;
        }
      }
      
      &.final-total {
        background-color: #f9fafb;
        padding: 1.8rem 2rem;
        border-radius: 0.8rem;
        margin-top: 1.5rem;
        font-size: 1.8rem;
        font-weight: 700;
        color: #2d2d2d;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        
        p {
          font-size: 1.8rem;
          color: #2d2d2d;
          font-weight: 700;
          
          &:last-child {
            font-size: 2rem;
          }
        }
      }
    }
    
    .total-divider {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 1.5rem 0;
    }
    
    .free-delivery-badge {
      text-align: center;
      margin-top: 1.5rem;
      
      span {
        background: #10b981;
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 2rem;
        font-size: 1.3rem;
        font-weight: 600;
        display: inline-block;
      }
    }
  }

  .payment-link {
    text-decoration: none;
    margin-top: 2rem;
    display: block;
  }

  .proceed-to-pay-btn {
    width: 100%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 1.5rem 3rem;
    font-size: 1.6rem;
    font-weight: 600;
    border: none;
    border-radius: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, #5a67d8, #6b46c1);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }

  .order-total--amount {
    display: none; /* Hidden - replaced by new order summary */
  }

  .proceed-to-pay {
    display: none; /* Hidden - button now inside order summary */
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 6rem 0;

    .container {
      padding: 0 1rem;
    }

    .cart-card {
      padding: 2rem 1.5rem;
    }

    .cart-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
    }

    .cart-title {
      font-size: 2rem;
    }

    .cart-user--profile {
      img {
        width: 45px;
        height: 45px;
      }

      .cart-user--name {
        font-size: 1.4rem;
      }
    }

    /* Two Column Layout becomes Single Column on Mobile */
    .checkout-container {
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-top: 2rem;
    }

    .grid-five-column {
      grid-template-columns: 1.5fr 1fr 0.5fr;
      gap: 1rem;
    }

    .cart_heading {
      p {
        font-size: 1.2rem;
      }
    }

    .cart-hide {
      display: none;
    }

    .cart-image--name {
      img {
        width: 60px;
        height: 60px;
      }

      div p {
        font-size: 1.3rem;
      }
    }

    .cart-footer {
      flex-direction: column;
      gap: 1rem;

      button {
        width: 100%;
        padding: 1.2rem 2rem;
        font-size: 1.3rem;
      }
    }

    .savings-summary-card {
      padding: 2rem 1.5rem;
    }

    .order-summary-card {
      padding: 2rem 1.5rem;
    }

    .proceed-to-pay-btn {
      padding: 1.2rem 2rem;
      font-size: 1.4rem;
    }

    .savings-title {
      font-size: 1.8rem;
      margin-bottom: 2rem;
    }

    .deal-banner,
    .premium-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
      padding: 1.5rem;

      .deal-content,
      .premium-content {
        gap: 1rem;

        .deal-icon,
        .premium-icon {
          font-size: 2rem;
        }

        .deal-text,
        .premium-text {
          h3 {
            font-size: 1.6rem;
          }

          p {
            font-size: 1.2rem;
          }
        }
      }

      .deal-amount,
      .premium-amount {
        font-size: 1.8rem;
        margin-left: 0;
      }
    }

    .unlock-savings {
      flex-direction: column;
      align-items: stretch;
      gap: 1.5rem;
      padding: 1.5rem;

      .unlock-content {
        justify-content: center;

        .unlock-icon {
          font-size: 2rem;
        }

        .unlock-text {
          font-size: 1.4rem;
        }
      }

      .view-offers-btn {
        width: 100%;
        padding: 1.2rem;
        font-size: 1.3rem;
      }
    }

    .order-total--amount {
      width: 100%;
      align-items: flex-start;

      .order-total--subdata {
        width: 100%;
        padding: 2rem;
      }
    }

    .proceed-to-pay {
      justify-content: center;
      padding: 0 1rem;

      a button {
        width: 100%;
        max-width: 300px;
        padding: 1.2rem 2rem;
        font-size: 1.4rem;
      }
    }
  }
`;

// Offers Modal Overlay
const OffersModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

// Offers Modal
const OffersModal = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 650px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  position: relative;

  /* Smooth scrolling for modal content */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2.5rem 3rem;
    border-bottom: 2px solid #f0f0f0;

    h2 {
      font-size: 2.2rem;
      font-weight: 700;
      color: #4a4a4a;
      margin: 0;
    }

    .close-btn {
      width: 40px;
      height: 40px;
      border: 2px solid #d97706;
      border-radius: 8px;
      background: white;
      color: #d97706;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      transition: all 0.2s ease;

      &:hover {
        background: #d97706;
        color: white;
      }
    }
  }

  .offers-list {
    padding: 2rem 3rem 3rem;
  }

  .offer-card {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 2rem 0;
    transition: all 0.3s ease;

    &.applied {
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 2rem;
      margin: 0 -1rem;
    }

    .offer-icon {
      width: 50px;
      height: 50px;
      border: 2px solid #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d97706;
      font-size: 2.2rem;
      flex-shrink: 0;
    }

    .offer-content {
      flex: 1;

      h3 {
        font-size: 1.6rem;
        font-weight: 700;
        color: #2d2d2d;
        margin: 0 0 0.8rem 0;
        line-height: 1.4;
      }

      p {
        font-size: 1.3rem;
        color: #6b7280;
        margin: 0;
        line-height: 1.5;
      }

      .tc-content {
        background: #f3f4f6;
        border-radius: 8px;
        padding: 1.2rem 1.5rem;
        margin-top: 1rem;

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            font-size: 1.2rem;
            color: #4a4a4a;
            line-height: 1.8;
            margin-bottom: 0.5rem;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .offer-link {
      background: transparent;
      border: none;
      color: #d97706;
      font-size: 1.4rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 0;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        color: #b45309;
        text-decoration: underline;
      }
    }

    .apply-btn {
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.8rem 2rem;
      font-size: 1.3rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;

      &:hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }
    }

    .applied-status {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      color: #10b981;
      font-size: 1.4rem;
      font-weight: 700;

      svg {
        font-size: 2rem;
      }
    }
  }

  .offer-divider {
    height: 1px;
    background: #e5e7eb;
    margin: 0;
  }

  @media (max-width: 768px) {
    max-width: 95%;
    max-height: 90vh;

    .modal-header {
      padding: 2rem 1.5rem;

      h2 {
        font-size: 1.8rem;
      }

      .close-btn {
        width: 36px;
        height: 36px;
        font-size: 1.8rem;
      }
    }

    .offers-list {
      padding: 1.5rem;
    }

    .offer-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.2rem;
      padding: 1.5rem 0;

      .offer-icon {
        width: 45px;
        height: 45px;
        font-size: 2rem;
      }

      .offer-content {
        h3 {
          font-size: 1.5rem;
        }

        p {
          font-size: 1.2rem;
        }
      }

      .offer-link,
      .apply-btn {
        width: 100%;
        text-align: center;
        padding: 1rem 1.5rem;
      }
    }
  }
`;

// Success Toast
const SuccessToast = styled.div`
  position: fixed;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  z-index: 10001;
  animation: slideUpToast 0.3s ease-out;

  @keyframes slideUpToast {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  svg {
    font-size: 2rem;
  }

  @media (max-width: 768px) {
    bottom: 2rem;
    padding: 1rem 2rem;
    font-size: 1.3rem;
    max-width: 90%;
    text-align: center;
  }
`;

// Secondary Modal Overlay
const SecondaryModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
  overscroll-behavior: contain;
`;

// Secondary Modal
const SecondaryModal = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  animation: scaleIn 0.3s ease-out;
  position: relative;
  overscroll-behavior: contain;

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .secondary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2.5rem;
    border-bottom: 2px solid #f0f0f0;

    h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #4a4a4a;
      margin: 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      transition: all 0.2s ease;
      border-radius: 6px;

      &:hover {
        background: #f3f4f6;
        color: #2d2d2d;
      }
    }
  }

  .secondary-content {
    padding: 2.5rem;

    p {
      font-size: 1.4rem;
      color: #4a4a4a;
      line-height: 1.8;
      margin: 0;
    }
  }

  .ok-btn {
    width: calc(100% - 5rem);
    margin: 0 2.5rem 2.5rem;
    padding: 1.2rem 2rem;
    background: white;
    color: #d97706;
    border: 2px solid #d97706;
    border-radius: 8px;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #d97706;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    }
  }

  @media (max-width: 768px) {
    max-width: 90%;

    .secondary-header {
      padding: 1.5rem 2rem;

      h3 {
        font-size: 1.8rem;
      }
    }

    .secondary-content {
      padding: 2rem;

      p {
        font-size: 1.3rem;
      }
    }

    .ok-btn {
      width: calc(100% - 4rem);
      margin: 0 2rem 2rem;
      padding: 1.2rem;
      font-size: 1.4rem;
    }
  }
`;

export default Cart;




// import React from "react";
// import styled from "styled-components";
// import { useCartContext } from "./context/cart_context";
// import CartItem from "./components/CartItem";
// import { NavLink } from "react-router-dom";
// import { Button } from "./styles/Button";
// import FormatPrice from "./Helpers/FormatPrice";
// import { useAuth0 } from "@auth0/auth0-react";

// // Import your GIF here
// import emptyCartGif from "./assets/cartGif.gif"; // Adjust the path to your GIF file

// const Cart = () => {
//   const { cart, clearCart, total_price, shipping_fee } = useCartContext();
//   const { isAuthenticated, user } = useAuth0();

//   if (cart.length === 0) {
//     return (
//       <EmptyCartWrapper>
//         <img src={emptyCartGif} alt="Empty Cart" />
//         <h3>Your Cart is Empty</h3>
//         <NavLink to="/products">
//           <Button>Continue Shopping</Button>
//         </NavLink>
//       </EmptyCartWrapper>
//     );
//   }

//   return (
//     <Wrapper>
//       <div className="container">
//         {isAuthenticated && (
//           <div className="cart-user--profile">
//             <img src={user.picture} alt={user.name} />
//             <h2 className="cart-user--name">{user.name}</h2>
//           </div>
//         )}

//         <div className="cart_heading grid grid-five-column">
//           <p>Item</p>
//           <p className="cart-hide">Price</p>
//           <p>Quantity</p>
//           <p className="cart-hide">Subtotal</p>
//           <p>Remove</p>
//         </div>
//         <hr />
//         <div className="cart-item">
//           {cart.map((curElem) => {
//             return <CartItem key={curElem.id} {...curElem} />;
//           })}
//         </div>
//         <hr />
//         <div className="cart-two-button">
//           <NavLink to="/products">
//             <Button>Continue Shopping</Button>
//           </NavLink>
//           <Button className="btn btn-clear" onClick={clearCart}>
//             Clear Cart
//           </Button>
//         </div>

//         <div className="order-total--amount">
//           <div className="order-total--subdata">
//             <div>
//               <p>Subtotal:</p>
//               <p>
//                 <FormatPrice price={total_price} />
//               </p>
//             </div>
//             <div>
//               <p>Shipping Fee:</p>
//               <p>
//                 <FormatPrice price={shipping_fee} />
//               </p>
//             </div>
//             <hr />
//             <div>
//               <p>Order Total:</p>
//               <p>
//                 <FormatPrice price={shipping_fee + total_price} />
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// const EmptyCartWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   height: 50vh;
//   text-align: center;

//   img {
//     width: 300px;
//     margin-bottom: 1rem;
//   }

//   h3 {
//     font-size: 2rem;
//     font-weight: 400;
//     margin-bottom: 1rem;
//     text-transform: capitalize;
//   }

//   a {
//     text-decoration: none;
//   }
// `;

// const Wrapper = styled.section`
//   /* Same styles as before */
// `;

// export default Cart;
