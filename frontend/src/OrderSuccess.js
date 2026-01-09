import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Confetti from 'react-confetti';
import { useUser } from "@clerk/clerk-react";
import FormatPrice from "./Helpers/FormatPrice";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Get payment details from location state
  const paymentId = location.state?.paymentId || 'N/A';
  const orderId = location.state?.orderId || 'N/A';
  const amount = location.state?.amount || 0;

  // Generate Order ID from Razorpay Order ID
  const displayOrderId = orderId !== 'N/A' 
    ? `#ORD-${orderId.slice(-8).toUpperCase()}`
    : '#ORD-XXXXXXXX';

  // Calculate delivery date (3 days from now)
  const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return `By ${deliveryDate.toLocaleDateString('en-US', options)}`;
  };

  // Get user's first name
  const getUserFirstName = () => {
    if (!user) return 'Customer';
    return user.firstName || user.fullName?.split(' ')[0] || 'Customer';
  };

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Wrapper>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="container">
        <div className="success-card">
          {/* Animated Checkmark */}
          <div className="checkmark-wrapper">
            <div className="checkmark-circle">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle-line" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">
            Thank you for your purchase, <span className="user-name">{getUserFirstName()}</span>!
          </p>

          {/* Order Details Box */}
          <div className="order-details-box">
            <div className="detail-row">
              <span className="detail-label">Order ID:</span>
              <span className="detail-value order-id">{displayOrderId}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Payment ID:</span>
              <span className="detail-value payment-id">{paymentId}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Estimated Delivery:</span>
              <span className="detail-value delivery-date">{getDeliveryDate()}</span>
            </div>

            <div className="detail-row amount-row">
              <span className="detail-label">Amount Paid:</span>
              <span className="detail-value amount-paid">
                <FormatPrice price={amount * 100} />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/orders')}
            >
              TRACK ORDER
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/products')}
            >
              CONTINUE SHOPPING
            </button>
          </div>

          {/* Footer Message */}
          <p className="footer-message">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </Wrapper>
  );
};

// Animations
const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const drawCircle = keyframes`
  0% {
    stroke-dashoffset: 166;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const drawCheck = keyframes`
  0% {
    stroke-dashoffset: 48;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Wrapper = styled.section`
  padding: 9rem 0;
  background: #fff8e7;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  .container {
    max-width: 650px;
    margin: 0 auto;
    padding: 0 2rem;
    width: 100%;
  }

  .success-card {
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.1);
    padding: 4rem 3rem;
    text-align: center;
    animation: ${fadeInUp} 0.6s ease-out;
  }

  /* Animated Checkmark */
  .checkmark-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .checkmark-circle {
    width: 120px;
    height: 120px;
    position: relative;
    animation: ${scaleIn} 0.5s ease-out;
  }

  .checkmark {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .checkmark-circle-line {
    stroke: #10b981;
    stroke-width: 2;
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    animation: ${drawCircle} 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    animation-delay: 0.2s;
  }

  .checkmark-check {
    stroke: #10b981;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    animation: ${drawCheck} 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    animation-delay: 0.6s;
  }

  /* Success Message */
  .success-title {
    font-size: 3.2rem;
    font-weight: 800;
    color: #2d2d2d;
    margin: 0 0 1rem 0;
    animation: ${fadeInUp} 0.6s ease-out 0.3s both;
  }

  .success-subtitle {
    font-size: 1.8rem;
    color: #6b7280;
    margin: 0 0 3rem 0;
    animation: ${fadeInUp} 0.6s ease-out 0.4s both;

    .user-name {
      color: #667eea;
      font-weight: 700;
    }
  }

  /* Order Details Box */
  .order-details-box {
    background: #f9fafb;
    border-radius: 16px;
    padding: 2.5rem;
    margin-bottom: 3rem;
    text-align: left;
    animation: ${fadeInUp} 0.6s ease-out 0.5s both;

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2rem 0;
      border-bottom: 1px solid #e5e7eb;

      &:last-child {
        border-bottom: none;
      }

      &.amount-row {
        margin-top: 1rem;
        padding-top: 1.5rem;
        border-top: 2px solid #e5e7eb;
        border-bottom: none;
      }

      .detail-label {
        font-size: 1.5rem;
        color: #6b7280;
        font-weight: 500;
      }

      .detail-value {
        font-size: 1.5rem;
        color: #2d2d2d;
        font-weight: 600;
        font-variant-numeric: tabular-nums;

        &.order-id {
          font-family: 'Courier New', monospace;
          color: #667eea;
          font-size: 1.6rem;
        }

        &.payment-id {
          font-family: 'Courier New', monospace;
          font-size: 1.3rem;
          color: #4b5563;
        }

        &.delivery-date {
          color: #10b981;
          font-weight: 700;
        }

        &.amount-paid {
          font-size: 2.2rem;
          color: #10b981;
          font-weight: 800;
        }
      }
    }
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeInUp} 0.6s ease-out 0.6s both;

    button {
      flex: 1;
      padding: 1.5rem 2rem;
      font-size: 1.6rem;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
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

    .btn-secondary {
      background: white;
      color: #92400e;
      border: 2px solid #92400e;

      &:hover {
        background: #92400e;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(146, 64, 14, 0.2);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  /* Footer Message */
  .footer-message {
    font-size: 1.4rem;
    color: #9ca3af;
    margin: 0;
    animation: ${fadeInUp} 0.6s ease-out 0.7s both;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    padding: 6rem 0;

    .container {
      padding: 0 1rem;
    }

    .success-card {
      padding: 3rem 2rem;
      border-radius: 20px;
    }

    .checkmark-circle {
      width: 100px;
      height: 100px;
    }

    .success-title {
      font-size: 2.6rem;
    }

    .success-subtitle {
      font-size: 1.6rem;
    }

    .order-details-box {
      padding: 2rem;

      .detail-row {
        padding: 1rem 0;

        .detail-label {
          font-size: 1.4rem;
        }

        .detail-value {
          font-size: 1.4rem;

          &.order-id {
            font-size: 1.5rem;
          }

          &.payment-id {
            font-size: 1.2rem;
          }

          &.amount-paid {
            font-size: 2rem;
          }
        }
      }
    }

    .action-buttons {
      flex-direction: column;
      gap: 1rem;

      button {
        padding: 1.4rem 1.5rem;
        font-size: 1.5rem;
      }
    }

    .footer-message {
      font-size: 1.3rem;
    }
  }
`;

export default OrderSuccess;
