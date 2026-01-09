import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiX, FiTrash2 } from 'react-icons/fi';

/**
 * Custom Toast Component with Progress Bar
 * @param {string} message - The message to display
 * @param {string} type - 'add' for green (success) or 'remove' for red (delete)
 * @param {string} toastId - Unique ID for this toast
 */
const CustomToast = ({ message, type = 'add', toastId }) => {
  const [progress, setProgress] = useState(100);
  
  // Determine colors and icons based on type
  const isAddAction = type === 'add';
  const backgroundColor = isAddAction ? '#00C851' : '#EF4444';
  const progressBarColor = 'rgba(255, 255, 255, 0.6)';
  const Icon = isAddAction ? FiCheckCircle : FiTrash2;

  useEffect(() => {
    // Animate progress bar from 100% to 0% over 3 seconds
    const startTime = Date.now();
    const duration = 3000;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      
      if (remaining > 0) {
        setProgress(remaining);
        requestAnimationFrame(updateProgress);
      } else {
        setProgress(0);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        minWidth: '320px',
        maxWidth: '420px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {/* Left: Icon + Message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <Icon style={{ color: '#ffffff', fontSize: '24px', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: '1.4' }}>
          {message}
        </span>
      </div>

      {/* Right: Close Button */}
      <button
        onClick={() => toast.dismiss(toastId)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          borderRadius: '50%',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        aria-label="Close notification"
      >
        <FiX style={{ fontSize: '20px' }} />
      </button>

      {/* Progress Bar at Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '4px',
          width: `${progress}%`,
          backgroundColor: progressBarColor,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
};

/**
 * Main Toast Trigger Function
 * @param {string} message - The message to display
 * @param {string} type - 'add' for green success or 'remove' for red delete
 */
export const customToast = (message, type = 'add') => {
  toast.custom(
    (t) => (
      <CustomToast
        message={message}
        type={type}
        toastId={t.id}
      />
    ),
    {
      duration: 3000,
      position: 'top-right',
    }
  );
};

/**
 * Helper Functions for Specific Notifications
 */

// Add to Cart - Green Background
export const notifyAddToCart = () => {
  customToast('Item added to cart successfully!', 'add');
};

// Add to Wishlist - Green Background
export const notifyAddToWishlist = () => {
  customToast('Item added to wishlist!', 'add');
};

// Remove from Cart - Red Background  
export const notifyRemoveFromCart = () => {
  customToast('Item removed from cart.', 'remove');
};

// Remove from Wishlist - Red Background
export const notifyRemoveFromWishlist = () => {
  customToast('Item removed from wishlist.', 'remove');
};

export default CustomToast;
