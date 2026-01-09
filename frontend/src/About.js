import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaLeaf, FaAward, FaSeedling, FaHandHoldingHeart, FaTruck, FaUsers, FaHandsHelping } from 'react-icons/fa';
import { GiWheat } from 'react-icons/gi';
import { MdVerified } from 'react-icons/md';

const About = () => {
  return (
    <Wrapper>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">🥜 Est. 1985</span>
          <h1>Our Legacy</h1>
          <p className="hero-subtitle">Delivering the Finest Goan Cashews Since 1985</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">38+</span>
              <span className="stat-label">Years of Excellence</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Natural & Organic</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <img src="images/hero.jpg" alt="Cashew Orchards of Goa" />
              <div className="image-badge">
                <GiWheat />
                <span>Family Owned</span>
              </div>
            </div>
            <div className="story-content">
              <span className="section-tag">Our Heritage</span>
              <h2>A Tradition of <span className="highlight">Handpicked Perfection</span></h2>
              <p>
                Nestled in the sun-kissed orchards of Goa, <strong>Sawaikar's Cashew Store</strong> began 
                as a humble family venture in 1985. What started as a passion for preserving traditional 
                harvesting methods has blossomed into Goa's most trusted name in premium cashews.
              </p>
              <p>
                Our cashews are nurtured in the fertile laterite soils of Goa, where the perfect blend of 
                tropical climate and monsoon rains creates nuts of unparalleled richness. Every cashew 
                undergoes <em>artisanal processing</em>—from hand-harvesting to sun-drying—ensuring that 
                each kernel retains its natural sweetness and distinctive crunch.
              </p>
              <div className="story-highlights">
                <div className="highlight-item">
                  <FaHandsHelping className="highlight-icon" />
                  <div>
                    <h4>Traditional Harvesting</h4>
                    <p>Hand-picked at peak ripeness for maximum flavor</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <FaSeedling className="highlight-icon" />
                  <div>
                    <h4>Organic Farming</h4>
                    <p>No pesticides, only natural cultivation methods</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-card">
            <FaLeaf className="mission-icon" />
            <h3>Our Mission</h3>
            <blockquote>
              "To bring the authentic taste of premium Goan cashews to the world, while championing 
              sustainable farming practices and uplifting local farming communities. Every cashew 
              we sell carries with it the spirit of Goa—its warmth, its tradition, and its 
              commitment to excellence."
            </blockquote>
            <div className="mission-author">
              <span>— The Sawaikar Family</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2>The Sawaikar Promise</h2>
            <p>Every cashew tells a story of quality, care, and commitment</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon farm">
                <GiWheat />
              </div>
              <h3>Farm Fresh</h3>
              <p>
                Direct from our sun-drenched Goan orchards to your doorstep. No middlemen, 
                no warehouses—just <strong>pure, fresh goodness</strong> within days of harvest.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon quality">
                <FaAward />
              </div>
              <h3>Premium Quality</h3>
              <p>
                Each cashew is <strong>hand-sorted and graded</strong> by our expert team. 
                We select only the top 5% of our harvest—the finest W180 and W240 grades 
                for a truly <em>culinary delight</em>.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon sustainable">
                <FaLeaf />
              </div>
              <h3>Sustainable</h3>
              <p>
                Our eco-friendly packaging is <strong>100% biodegradable</strong>. We practice 
                regenerative farming, planting two trees for every one we harvest, ensuring 
                Goa's green legacy thrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="values-grid">
            <div className="value-item">
              <MdVerified className="value-icon" />
              <h4>FSSAI Certified</h4>
              <p>100% food safety compliant</p>
            </div>
            <div className="value-item">
              <FaHandHoldingHeart className="value-icon" />
              <h4>Community First</h4>
              <p>Supporting 200+ local farmers</p>
            </div>
            <div className="value-item">
              <FaTruck className="value-icon" />
              <h4>Pan-India Delivery</h4>
              <p>Fresh delivery within 3-5 days</p>
            </div>
            <div className="value-item">
              <FaUsers className="value-icon" />
              <h4>50,000+ Customers</h4>
              <p>Trusted by families nationwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Experience the Sawaikar Difference</h2>
            <p>Taste the authentic flavors of Goa's finest cashews, handpicked with love and delivered with care.</p>
            <NavLink to="/products" className="cta-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Explore Our Collection
            </NavLink>
          </div>
        </div>
      </section>

      {/* Founder's Note Section */}
      <section className="founders-note-section">
        <div className="container">
          <div className="founders-card">
            <div className="quote-icon">"</div>
            <div className="note-content">
              <p>
                It was the first time when my grandfather, <strong> Shri Vishwanath Sawaikar</strong>, first planted cashew saplings 
                in the laterite soil of Ponda in 1985, he made a simple promise—<em>every kernel that leaves 
                our godown will carry the warmth of our family's hands</em>.
              </p>
              <p>
                Three generations later, that promise remains unchanged. We still grade each cashew by hand. 
                We still roast in the same wood-fire drums. We still believe that shortcuts have no place 
                in tradition.
              </p>
              <p>
                When you open a pack of Sawaikar's, you're not just tasting cashews—you're tasting forty years 
                of Goan sunsets, monsoon rains, and a family's unwavering dedication to perfection.
              </p>
              <p className="note-closing">
                Thank you for being part of our journey.
              </p>
            </div>
            <div className="signature-area">
              <div className="signature">The Sawaikar Family</div>
              <div className="signature-subtitle">Ponda, Goa • Est. 1985</div>
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* Hero Section - Using theme colors */
  .hero-section {
    position: relative;
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.footer_bg} 0%, #5D3A1A 100%);
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 4rem 2rem;
    max-width: 90rem;
    
    .hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.8rem 2rem;
      border-radius: 5rem;
      color: ${({ theme }) => theme.colors.bg};
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    h1 {
      font-size: 5rem;
      font-weight: 800;
      color: ${({ theme }) => theme.colors.white};
      margin-bottom: 1.5rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .hero-subtitle {
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 400;
      margin-bottom: 3rem;
    }
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 4rem;
    margin-top: 3rem;
    
    .stat {
      text-align: center;
      padding: 1.5rem 2.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      .stat-number {
        display: block;
        font-size: 3rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.bg};
      }
      
      .stat-label {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.85);
        text-transform: uppercase;
        letter-spacing: 0.1rem;
      }
    }
  }

  /* Container */
  .container {
    max-width: 120rem;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Story Section */
  .story-section {
    padding: 8rem 0;
    background: ${({ theme }) => theme.colors.white};
  }

  .story-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 6rem;
    align-items: center;
  }

  .story-image {
    position: relative;
    
    img {
      width: 100%;
      border-radius: 2rem;
      box-shadow: 0 20px 50px rgba(139, 69, 19, 0.2);
      border: 4px solid ${({ theme }) => theme.colors.bg};
    }
    
    .image-badge {
      position: absolute;
      bottom: -2rem;
      right: -2rem;
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.btn}, ${({ theme }) => theme.colors.footer_bg});
      color: ${({ theme }) => theme.colors.white};
      padding: 1.5rem 2.5rem;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
      font-size: 1.4rem;
      box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);
      
      svg {
        font-size: 2rem;
      }
    }
  }

  .story-content {
    .section-tag {
      display: inline-block;
      color: ${({ theme }) => theme.colors.btn};
      font-size: 1.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.2rem;
      margin-bottom: 1.5rem;
      background: ${({ theme }) => theme.colors.bg};
      padding: 0.5rem 1.5rem;
      border-radius: 2rem;
    }
    
    h2 {
      font-size: 3.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 2rem;
      line-height: 1.3;
      
      .highlight {
        color: ${({ theme }) => theme.colors.btn};
      }
    }
    
    p {
      font-size: 1.6rem;
      line-height: 1.8;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 1.5rem;
    }
  }

  .story-highlights {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 3rem;
    
    .highlight-item {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
      padding: 2rem;
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 1rem;
      transition: all 0.3s ease;
      border: 1px solid ${({ theme }) => theme.colors.border};
      
      &:hover {
        transform: translateX(1rem);
        box-shadow: 0 10px 30px rgba(139, 69, 19, 0.1);
      }
      
      .highlight-icon {
        font-size: 3rem;
        color: ${({ theme }) => theme.colors.footer_bg};
        flex-shrink: 0;
      }
      
      h4 {
        font-size: 1.6rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.heading};
        margin-bottom: 0.5rem;
      }
      
      p {
        font-size: 1.4rem;
        margin: 0;
        color: ${({ theme }) => theme.colors.text};
      }
    }
  }

  /* Mission Section */
  .mission-section {
    padding: 6rem 0;
    background: ${({ theme }) => theme.colors.bg};
  }

  .mission-card {
    max-width: 80rem;
    margin: 0 auto;
    text-align: center;
    padding: 5rem;
    background: ${({ theme }) => theme.colors.white};
    border-radius: 2rem;
    box-shadow: 0 20px 60px rgba(139, 69, 19, 0.1);
    position: relative;
    border: 1px solid ${({ theme }) => theme.colors.border};
    
    .mission-icon {
      font-size: 4rem;
      color: ${({ theme }) => theme.colors.btn};
      margin-bottom: 2rem;
    }
    
    h3 {
      font-size: 2.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 2rem;
    }
    
    blockquote {
      font-size: 1.8rem;
      line-height: 1.9;
      color: ${({ theme }) => theme.colors.text};
      font-style: italic;
      position: relative;
      padding: 0 3rem;
      
      &::before,
      &::after {
        content: '"';
        font-size: 4rem;
        color: ${({ theme }) => theme.colors.btn};
        opacity: 0.4;
        position: absolute;
      }
      
      &::before {
        top: -2rem;
        left: 0;
      }
      
      &::after {
        bottom: -3rem;
        right: 0;
      }
    }
    
    .mission-author {
      margin-top: 3rem;
      font-size: 1.4rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.footer_bg};
    }
  }

  /* Features Section */
  .features-section {
    padding: 8rem 0;
    background: ${({ theme }) => theme.colors.white};
  }

  .section-header {
    text-align: center;
    margin-bottom: 5rem;
    
    .section-tag {
      display: inline-block;
      color: ${({ theme }) => theme.colors.btn};
      font-size: 1.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.2rem;
      margin-bottom: 1rem;
      background: ${({ theme }) => theme.colors.bg};
      padding: 0.5rem 1.5rem;
      border-radius: 2rem;
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
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }

  .feature-card {
    text-align: center;
    padding: 4rem 3rem;
    background: ${({ theme }) => theme.colors.bg};
    border-radius: 2rem;
    transition: all 0.3s ease;
    border: 1px solid ${({ theme }) => theme.colors.border};
    
    &:hover {
      transform: translateY(-1rem);
      box-shadow: 0 20px 50px rgba(139, 69, 19, 0.15);
    }
    
    .feature-icon {
      width: 8rem;
      height: 8rem;
      margin: 0 auto 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        font-size: 3.5rem;
        color: ${({ theme }) => theme.colors.white};
      }
      
      &.farm {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.helper}, ${({ theme }) => theme.colors.btn});
      }
      
      &.quality {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.btn}, ${({ theme }) => theme.colors.footer_bg});
      }
      
      &.sustainable {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.footer_bg}, #5D3A1A);
      }
    }
    
    h3 {
      font-size: 2rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 1.5rem;
    }
    
    p {
      font-size: 1.5rem;
      line-height: 1.7;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  /* Values Section */
  .values-section {
    padding: 5rem 0;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.footer_bg} 0%, #5D3A1A 100%);
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3rem;
  }

  .value-item {
    text-align: center;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-5px);
    }
    
    .value-icon {
      font-size: 3.5rem;
      color: ${({ theme }) => theme.colors.bg};
      margin-bottom: 1.5rem;
    }
    
    h4 {
      font-size: 1.6rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.white};
      margin-bottom: 0.8rem;
    }
    
    p {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  /* CTA Section */
  .cta-section {
    padding: 8rem 0;
    background: ${({ theme }) => theme.colors.bg};
  }

  .cta-content {
    text-align: center;
    max-width: 60rem;
    margin: 0 auto;
    padding: 4rem;
    background: ${({ theme }) => theme.colors.white};
    border-radius: 2rem;
    box-shadow: 0 20px 60px rgba(139, 69, 19, 0.1);
    border: 1px solid ${({ theme }) => theme.colors.border};
    
    h2 {
      font-size: 3rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 1.5rem;
    }
    
    p {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 3rem;
    }
    
    .cta-btn {
      display: inline-block;
      padding: 1.5rem 4rem;
      background: linear-gradient(135deg, ${({ theme }) => theme.colors.btn}, ${({ theme }) => theme.colors.footer_bg});
      color: ${({ theme }) => theme.colors.white};
      font-size: 1.6rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 5rem;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.1rem;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(139, 69, 19, 0.4);
      }
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .values-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .hero-content {
      h1 {
        font-size: 3.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.6rem;
      }
    }
    
    .hero-stats {
      flex-direction: column;
      gap: 1.5rem;
      
      .stat {
        padding: 1.2rem 2rem;
      }
    }
    
    .story-grid {
      grid-template-columns: 1fr;
      gap: 4rem;
    }
    
    .story-image .image-badge {
      bottom: -1rem;
      right: 1rem;
    }
    
    .story-content h2 {
      font-size: 2.8rem;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    .values-grid {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .mission-card {
      padding: 3rem 2rem;
      
      blockquote {
        font-size: 1.5rem;
        padding: 0 1rem;
      }
    }
    
    .section-header h2 {
      font-size: 2.8rem;
    }
    
    .cta-content {
      padding: 3rem 2rem;
      
      h2 {
        font-size: 2.5rem;
      }
    }
  }

  @media (max-width: 480px) {
    .hero-content h1 {
      font-size: 2.8rem;
    }
    
    .values-grid {
      grid-template-columns: 1fr;
    }
    
    .story-highlights .highlight-item {
      flex-direction: column;
      text-align: center;
    }
  }

  /* Founder's Note Section */
  .founders-note-section {
    padding: 6rem 0 8rem;
    background: linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 100%);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
    }
  }

  .founders-card {
    max-width: 85rem;
    margin: 0 auto;
    background: #FFFBF7;
    border-radius: 1.2rem;
    padding: 5rem 6rem;
    position: relative;
    box-shadow: 0 20px 60px rgba(139, 69, 19, 0.08);
    border: 1px solid rgba(139, 69, 19, 0.1);
    
    .quote-icon {
      position: absolute;
      top: 2.5rem;
      left: 4rem;
      font-size: 12rem;
      line-height: 1;
      font-family: 'Georgia', serif;
      color: rgba(139, 69, 19, 0.08);
      pointer-events: none;
    }
  }

  .note-content {
    position: relative;
    z-index: 2;
    
    p {
      font-size: 1.7rem;
      line-height: 1.9;
      color: #5D4E3A;
      margin-bottom: 1.8rem;
      
      strong {
        color: #8B4513;
      }
      
      em {
        font-style: italic;
        color: #7A6B55;
      }
    }
    
    .note-closing {
      margin-top: 2.5rem;
      margin-bottom: 3rem;
      font-weight: 500;
      color: #8B4513;
    }
  }

  .signature-area {
    text-align: right;
    padding-top: 2rem;
    border-top: 1px solid rgba(139, 69, 19, 0.15);
    
    .signature {
      font-family: 'Brush Script MT', 'Segoe Script', 'Dancing Script', cursive;
      font-size: 3.2rem;
      color: #8B4513;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
    }
    
    .signature-subtitle {
      font-size: 1.3rem;
      color: #9A8B7A;
      text-transform: uppercase;
      letter-spacing: 0.2em;
    }
  }

  @media (max-width: 768px) {
    .founders-card {
      padding: 3rem 2.5rem;
      
      .quote-icon {
        font-size: 8rem;
        top: 1.5rem;
        left: 2rem;
      }
    }
    
    .note-content p {
      font-size: 1.5rem;
    }
    
    .signature-area .signature {
      font-size: 2.5rem;
    }
  }
`;

export default About;
