import React from 'react';
import styled from 'styled-components';

const ProfessionalLogo = ({ size = 'medium', showText = true, variant = 'horizontal' }) => {
  const sizes = {
    small: { icon: 35, primary: '1.4rem', secondary: '0.9rem' },
    medium: { icon: 45, primary: '1.8rem', secondary: '1.1rem' },
    large: { icon: 60, primary: '2.4rem', secondary: '1.4rem' },
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <LogoWrapper $variant={variant} $size={size}>
      {/* SVG Cashew Icon */}
      <div className="logo-icon">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cashew nut shape */}
          <defs>
            <linearGradient id="cashewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D2691E" />
              <stop offset="50%" stopColor="#CD853F" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#228B22" />
              <stop offset="100%" stopColor="#006400" />
            </linearGradient>
          </defs>
          
          {/* Main cashew body - kidney shape */}
          <path
            d="M75 25C85 35 88 50 82 65C76 80 60 90 45 88C30 86 18 75 15 60C12 45 18 30 32 22C46 14 65 15 75 25Z"
            fill="url(#cashewGradient)"
          />
          
          {/* Cashew curve detail */}
          <path
            d="M70 30C78 38 80 50 75 62C70 74 58 82 46 80C34 78 25 70 23 58"
            stroke="#FFF8DC"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
          
          {/* Small leaf accent */}
          <path
            d="M28 18C32 12 42 10 48 14C42 14 34 16 28 18Z"
            fill="url(#leafGradient)"
          />
          <path
            d="M30 16C34 14 40 13 44 14"
            stroke="#228B22"
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          
          {/* Shine effect */}
          <ellipse
            cx="55"
            cy="40"
            rx="8"
            ry="5"
            fill="#FFF8DC"
            opacity="0.3"
            transform="rotate(-30 55 40)"
          />
        </svg>
      </div>

      {showText && (
        <div className="logo-text">
          <span className="brand-name">Sawaikar's</span>
          <span className="brand-tagline">PREMIUM CASHEWS</span>
        </div>
      )}
    </LogoWrapper>
  );
};

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ $size }) => ($size === 'small' ? '0.8rem' : $size === 'large' ? '1.5rem' : '1rem')};
  flex-direction: ${({ $variant }) => ($variant === 'vertical' ? 'column' : 'row')};

  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #FFF8DC, #f5f0e1);
    border-radius: 50%;
    padding: ${({ $size }) => ($size === 'small' ? '0.5rem' : $size === 'large' ? '1rem' : '0.7rem')};
    box-shadow: 
      0 4px 15px rgba(139, 69, 19, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;

    &:hover {
      transform: rotate(-5deg) scale(1.05);
      box-shadow: 
        0 6px 20px rgba(139, 69, 19, 0.3),
        inset 0 2px 4px rgba(255, 255, 255, 0.8);
    }

    svg {
      display: block;
    }
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    text-align: ${({ $variant }) => ($variant === 'vertical' ? 'center' : 'left')};
    line-height: 1.1;

    .brand-name {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-size: ${({ $size }) => 
        $size === 'small' ? '1.4rem' : 
        $size === 'large' ? '2.4rem' : '1.8rem'};
      font-weight: 700;
      color: #8B4513;
      letter-spacing: 0.02em;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    .brand-tagline {
      font-family: 'Lato', 'Arial', sans-serif;
      font-size: ${({ $size }) => 
        $size === 'small' ? '0.7rem' : 
        $size === 'large' ? '1rem' : '0.8rem'};
      font-weight: 600;
      color: #CD853F;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-top: 0.2rem;
    }
  }

  @media (max-width: 768px) {
    gap: 0.6rem;

    .logo-text {
      .brand-name {
        font-size: ${({ $size }) => 
          $size === 'small' ? '1.2rem' : 
          $size === 'large' ? '2rem' : '1.5rem'};
      }

      .brand-tagline {
        font-size: ${({ $size }) => 
          $size === 'small' ? '0.6rem' : 
          $size === 'large' ? '0.85rem' : '0.7rem'};
        letter-spacing: 0.15em;
      }
    }
  }
`;

export default ProfessionalLogo;
