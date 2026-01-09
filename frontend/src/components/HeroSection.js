import React from 'react'
import { NavLink } from 'react-router-dom';
import {Button} from '../styles/Button'
import styled from 'styled-components';

const HeroSection = ({myData}) => {
    const { name, intro } = myData;
    
  return (
    <Wrapper>
     <div className='container'>
        <div className="grid grid-two-column">
            <div className="hero-section-data">
              <span className="premium-badge">🥜 Premium Quality Since 1985</span>
              <h1>{name}</h1>
              <p className="hero-description">
                {intro || "Experience the finest selection of premium cashews from Goa's heritage farms. From traditional roasted varieties to exotic flavored cashews, we bring you the authentic taste of quality nuts with every bite."}
              </p>
              <div className="hero-features">
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>100% Organic</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Farm Fresh</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">✓</span>
                  <span>Free Shipping</span>
                </div>
              </div>
              <NavLink to="/products" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <Button className="hero-btn">Shop Now</Button>
              </NavLink>
            </div>
            <div className="hero-section-image">
              <div className="image-container">
                <img src="images/hero.jpg" alt="Premium cashews display" className="img-style"/>
                <div className="floating-badge top-badge">
                  <span className="badge-number">50K+</span>
                  <span className="badge-text">Happy Customers</span>
                </div>
                <div className="floating-badge bottom-badge">
                  <span className="badge-number">38+</span>
                  <span className="badge-text">Years of Trust</span>
                </div>
              </div>
            </div>
        </div>
     </div>
    </Wrapper>
  )
}

const Wrapper = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.bg} 0%, #f8f4e6 100%);
  overflow: hidden;
  
  .container {
    max-width: 130rem;
    margin: 0 auto;
    padding: 0 3rem;
  }
  
  .grid {
    display: grid;
    gap: 5rem;
    align-items: center;
  }
  
  .grid-two-column {
    grid-template-columns: 1fr 1fr;
  }
  
  .hero-section-data {
    .premium-badge {
      display: inline-block;
      background: linear-gradient(135deg, rgba(205, 133, 63, 0.15), rgba(139, 69, 19, 0.1));
      color: ${({ theme }) => theme.colors.helper};
      padding: 1rem 2rem;
      border-radius: 5rem;
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 2rem;
      border: 1px solid rgba(205, 133, 63, 0.2);
    }

    h1 {
      font-size: 5.5rem;
      font-weight: 800;
      line-height: 1.15;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 2rem;
      
      background: linear-gradient(135deg, #8B4513, #CD853F);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-description {
      font-size: 1.8rem;
      line-height: 1.8;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 2.5rem;
    }

    .hero-features {
      display: flex;
      gap: 2.5rem;
      margin-bottom: 3rem;

      .feature {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 1.4rem;
        color: ${({ theme }) => theme.colors.text};
        font-weight: 500;

        .feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.2rem;
          height: 2.2rem;
          background: linear-gradient(135deg, #228B22, #006400);
          color: #fff;
          border-radius: 50%;
          font-size: 1rem;
          font-weight: 700;
        }
      }
    }

    .hero-btn {
      font-size: 1.6rem;
      padding: 1.5rem 4rem;
      box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(139, 69, 19, 0.4);
      }
    }
  }
  
  .hero-section-image {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .image-container {
    position: relative;
    max-width: 50rem;
    
    &::before {
      content: "";
      position: absolute;
      top: -2rem;
      right: -2rem;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.helper}, #8B4513);
      border-radius: 2rem;
      z-index: 0;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -3rem;
      left: -3rem;
      width: 15rem;
      height: 15rem;
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 50%;
      z-index: 0;
      opacity: 0.8;
    }
  }
  
  .img-style {
    position: relative;
    z-index: 1;
    width: 100%;
    height: auto;
    border-radius: 2rem;
    box-shadow: 0 25px 60px rgba(139, 69, 19, 0.25);
  }

  .floating-badge {
    position: absolute;
    z-index: 2;
    background: #fff;
    padding: 1.5rem 2rem;
    border-radius: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    text-align: center;

    .badge-number {
      display: block;
      font-size: 2.2rem;
      font-weight: 800;
      color: ${({ theme }) => theme.colors.helper};
    }

    .badge-text {
      font-size: 1.1rem;
      color: ${({ theme }) => theme.colors.text};
      font-weight: 500;
    }
  }

  .top-badge {
    top: 2rem;
    right: -2rem;
    animation: float 3s ease-in-out infinite;
  }

  .bottom-badge {
    bottom: 3rem;
    left: -2rem;
    animation: float 3s ease-in-out infinite;
    animation-delay: 1.5s;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .grid-two-column {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .hero-section-data {
      h1 {
        font-size: 4rem;
      }

      .hero-features {
        justify-content: center;
        flex-wrap: wrap;
      }
    }

    .hero-section-image {
      order: -1;
    }

    .image-container {
      max-width: 40rem;
    }

    .floating-badge {
      display: none;
    }
  }
  
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    padding: 4rem 0;
    
    .container {
      padding: 0 2rem;
    }
    
    .hero-section-data {
      .premium-badge {
        font-size: 1.2rem;
        padding: 0.8rem 1.5rem;
      }

      h1 {
        font-size: 3rem;
      }
      
      .hero-description {
        font-size: 1.5rem;
      }

      .hero-features {
        gap: 1.5rem;

        .feature {
          font-size: 1.2rem;
        }
      }
    }
    
    .image-container {
      max-width: 30rem;
      
      &::before {
        top: -1rem;
        right: -1rem;
      }

      &::after {
        display: none;
      }
    }
  }
`;

export default HeroSection
