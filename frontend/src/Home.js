import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import FeactureProducts from './components/FeactureProducts';
import HeroSection from './components/HeroSection';
import Services from './components/Services';
import Truested from './components/Truested';
import { GiWheat, GiSunrise, GiDiamondTrophy, GiCardboardBox } from 'react-icons/gi';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';
import { Button } from './styles/Button';

const Home = () => {
  const premiumData = {
    name: "Sawaikar's Legacy",
    intro: "Rooted in the red soil of Ponda since 1985. We don't just sell cashews; we deliver a slice of Goan heritage, hand-roasted to perfection in traditional wood-fire drums.",
    image: "/images/hero-cashew-farm.jpg",
  }

  const processSteps = [
    { icon: <GiWheat />, title: 'Hand Harvested', desc: 'Carefully hand-picked at peak ripeness from our family-owned orchards in Goa' },
    { icon: <GiSunrise />, title: 'Sun Dried', desc: 'Traditional Goan sun-drying method preserves natural oils and flavors' },
    { icon: <GiDiamondTrophy />, title: 'Wood Fire Roasted', desc: 'Slow-roasted over cashew wood fire for that authentic smoky taste' },
    { icon: <GiCardboardBox />, title: 'Fresh Packed', desc: 'Sealed within 24 hours in eco-friendly, airtight packaging' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The best cashews I\'ve ever tasted! So fresh and flavorful. Will definitely order again.' },
    { name: 'Rajesh Patel', location: 'Delhi', rating: 5, text: 'Premium quality that matches the price. My family loved the roasted variety!' },
    { name: 'Anita Desai', location: 'Bangalore', rating: 5, text: 'Finally found authentic Goan cashews. The taste reminds me of my childhood in Goa.' },
  ];

  return (
    <Wrapper>
      <HeroSection myData={premiumData}/>
      
      {/* Our Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Farm to Table</span>
            <h2>Our Process</h2>
            <p>Every cashew goes through our meticulous 4-step process to ensure premium quality</p>
          </div>
          
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <div className="process-card" key={index}>
                <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
                <div className="process-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {index < processSteps.length - 1 && <div className="connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeactureProducts/>
      <Services/>
      
      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2>What Our Customers Say</h2>
            <p>Join thousands of satisfied customers who trust Sawaikar's for premium cashews</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <FaQuoteLeft className="quote-icon" />
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star" />
                  ))}
                </div>
                <div className="customer-info">
                  <div className="customer-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cta-center">
            <NavLink to="/products" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button>Shop Premium Cashews</Button>
            </NavLink>
          </div>
        </div>
      </section>

      <Truested/>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  /* Process Section */
  .process-section {
    padding: 8rem 0;
    background: linear-gradient(180deg, #fff 0%, ${({ theme }) => theme.colors.bg} 100%);
  }

  .container {
    max-width: 120rem;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .section-header {
    text-align: center;
    margin-bottom: 5rem;

    .section-tag {
      display: inline-block;
      color: ${({ theme }) => theme.colors.helper};
      font-size: 1.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.2rem;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 3.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
      max-width: 60rem;
      margin: 0 auto;
    }
  }

  .process-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    position: relative;
  }

  .process-card {
    text-align: center;
    padding: 3rem 2rem;
    background: #fff;
    border-radius: 2rem;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 5px 20px rgba(139, 69, 19, 0.08);

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px rgba(139, 69, 19, 0.15);
    }

    .step-number {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.helper};
      opacity: 0.5;
    }

    .process-icon {
      width: 8rem;
      height: 8rem;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.bg} 0%, #f5f0e1 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        font-size: 3.5rem;
        color: ${({ theme }) => theme.colors.helper};
      }
    }

    h3 {
      font-size: 2rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.text};
      line-height: 1.6;
    }

    .connector {
      display: none;
    }
  }

  /* Testimonials Section */
  .testimonials-section {
    padding: 8rem 0;
    background: linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%);
  }

  .testimonials-section .section-header {
    .section-tag {
      color: ${({ theme }) => theme.colors.bg};
    }

    h2 {
      color: #fff;
    }

    p {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
    margin-bottom: 4rem;
  }

  .testimonial-card {
    background: #fff;
    padding: 3rem;
    border-radius: 2rem;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    }

    .quote-icon {
      font-size: 3rem;
      color: ${({ theme }) => theme.colors.helper};
      opacity: 0.3;
      margin-bottom: 1.5rem;
    }

    .testimonial-text {
      font-size: 1.5rem;
      line-height: 1.8;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 2rem;
      font-style: italic;
    }

    .rating {
      display: flex;
      gap: 0.3rem;
      margin-bottom: 2rem;

      .star {
        color: #FFD700;
        font-size: 1.6rem;
      }
    }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      .customer-avatar {
        width: 5rem;
        height: 5rem;
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.helper}, #8B4513);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 2rem;
        font-weight: 700;
      }

      h4 {
        font-size: 1.6rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.heading};
        margin-bottom: 0.3rem;
      }

      span {
        font-size: 1.3rem;
        color: ${({ theme }) => theme.colors.text};
      }
    }
  }

  .cta-center {
    text-align: center;
    
    a {
      text-decoration: none;
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .process-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .testimonials-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .process-section,
    .testimonials-section {
      padding: 5rem 0;
    }

    .section-header h2 {
      font-size: 2.8rem;
    }

    .process-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .testimonials-grid {
      grid-template-columns: 1fr;
    }

    .process-card {
      padding: 2.5rem 2rem;
    }
  }
`;

export default Home
