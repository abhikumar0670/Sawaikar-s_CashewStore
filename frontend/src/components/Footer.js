import React, { useState } from "react";
import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaDiscord, FaInstagram, FaYoutube, FaTwitter, FaFacebookF, FaLinkedinIn, FaPaperPlane } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }

    setSubscribing(true);
    
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'footer',
          preferences: {
            promotions: true,
            newProducts: true,
            weeklyDigest: true
          }
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        toast.error(data.message || "Subscription failed");
      }
    } catch (error) {
      console.error('Newsletter subscribe error:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleShopNow = () => {
    navigate("/products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Wrapper>
      {/* Top Floating CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Ready to Taste Premium Cashews?</h2>
            <p>Join thousands of happy customers enjoying Goa's finest cashews delivered to your doorstep.</p>
          </div>
          <button onClick={handleShopNow} className="cta-btn">
            Shop Now
          </button>
        </div>
      </section>

      {/* Main Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1 - About */}
            <div className="footer-col about-col">
              <h3 className="brand-name">🥜 Sawaikar's</h3>
              <p className="brand-desc">
                Since 1985, Goa's premier destination for authentic cashews. 
                From farm to table, we ensure the highest quality nuts with traditional 
                processing methods passed down through generations.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <MdPhone className="contact-icon" />
                  <span>+91 8604559981</span>
                </div>
                <div className="contact-item">
                  <MdEmail className="contact-icon" />
                  <span>info@sawaikars.com</span>
                </div>
                <div className="contact-item">
                  <MdLocationOn className="contact-icon" />
                  <span>Goa, India</span>
                </div>
              </div>
            </div>

            {/* Column 2 - Subscribe */}
            <div className="footer-col subscribe-col">
              <h4>Subscribe for Updates</h4>
              <p>Get exclusive offers, new product alerts, and cashew recipes delivered to your inbox.</p>
              <form className="subscribe-form" onSubmit={handleSubscribe}>
                <div className="input-wrapper">
                  <MdEmail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="subscribe-btn" disabled={subscribing}>
                  <FaPaperPlane /> {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Column 3 - Social */}
            <div className="footer-col social-col">
              <h4>Follow Us</h4>
              <p>Stay connected with us on social media for daily updates and behind-the-scenes content.</p>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon facebook">
                  <FaFacebookF />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon instagram">
                  <FaInstagram />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon twitter">
                  <FaTwitter />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon youtube">
                  <FaYoutube />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon linkedin">
                  <FaLinkedinIn />
                </a>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="social-icon discord">
                  <FaDiscord />
                </a>
              </div>
            </div>

            {/* Column 4 - Quick Links */}
            <div className="footer-col links-col">
              <h4>Quick Links</h4>
              <ul className="quick-links">
                <li><NavLink to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</NavLink></li>
                <li><NavLink to="/about" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>About Us</NavLink></li>
                <li><NavLink to="/products" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Products</NavLink></li>
                <li><NavLink to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Contact</NavLink></li>
                <li><NavLink to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>FAQ</NavLink></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <hr />
          <div className="bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} Sawaikar's Cashew Store. Made with 💚 by Abhishek Kumar. All Rights Reserved.
            </p>
            <div className="bottom-links">
              <NavLink to="/privacy">Privacy Policy</NavLink>
              <span className="divider">|</span>
              <NavLink to="/terms">Terms & Conditions</NavLink>
              <span className="divider">|</span>
              <NavLink to="/contact">Support</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  /* CTA Floating Section */
  .cta-section {
    position: relative;
    z-index: 10;
    max-width: 90rem;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .cta-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;
    padding: 4rem 5rem;
    background: linear-gradient(135deg, #CD853F 0%, #8B4513 100%);
    border-radius: 2rem;
    box-shadow: 0 20px 60px rgba(139, 69, 19, 0.4);
    transform: translateY(50%);
    
    .cta-content {
      h2 {
        color: #fff;
        font-size: 2.4rem;
        font-weight: 700;
        margin-bottom: 0.8rem;
      }
      
      p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.4rem;
        max-width: 45rem;
      }
    }
    
    .cta-btn {
      flex-shrink: 0;
      padding: 1.5rem 3.5rem;
      background: #fff;
      color: #8B4513;
      font-size: 1.6rem;
      font-weight: 600;
      border: none;
      border-radius: 5rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        background: #FFF8DC;
      }
    }
  }

  /* Main Footer */
  footer {
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.footer_bg} 0%, #5D3A1A 100%);
    padding: 12rem 0 0 0;
  }

  .footer-container {
    max-width: 130rem;
    margin: 0 auto;
    padding: 0 3rem;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
    gap: 4rem;
  }

  .footer-col {
    h4 {
      color: #fff;
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 2rem;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -0.8rem;
        left: 0;
        width: 4rem;
        height: 3px;
        background: linear-gradient(90deg, #CD853F, #D2691E);
        border-radius: 2px;
      }
    }
    
    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.4rem;
      line-height: 1.8;
    }
  }

  /* About Column */
  .about-col {
    .brand-name {
      color: #fff;
      font-size: 2.4rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }
    
    .brand-desc {
      margin-bottom: 2rem;
    }
    
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      
      .contact-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.4rem;
        
        .contact-icon {
          font-size: 1.8rem;
          color: #CD853F;
        }
      }
    }
  }

  /* Subscribe Column */
  .subscribe-col {
    .subscribe-form {
      margin-top: 2rem;
      
      .input-wrapper {
        position: relative;
        margin-bottom: 1.2rem;
        
        .input-icon {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #CD853F;
          font-size: 1.8rem;
        }
        
        input {
          width: 100%;
          padding: 1.4rem 1.5rem 1.4rem 4.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          color: #fff;
          font-size: 1.4rem;
          transition: all 0.3s ease;
          
          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          
          &:focus {
            outline: none;
            border-color: #CD853F;
            background: rgba(255, 255, 255, 0.15);
          }
        }
      }
      
      .subscribe-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        width: 100%;
        padding: 1.3rem 2rem;
        background: linear-gradient(135deg, #CD853F 0%, #D2691E 100%);
        color: #fff;
        font-size: 1.4rem;
        font-weight: 600;
        border: none;
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(205, 133, 63, 0.4);
        }
      }
    }
  }

  /* Social Column */
  .social-col {
    .social-icons {
      display: flex;
      flex-wrap: wrap;
      gap: 1.2rem;
      margin-top: 2rem;
      
      .social-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 1.8rem;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-3px);
        }
        
        &.facebook:hover {
          background: #1877f2;
          box-shadow: 0 5px 20px rgba(24, 119, 242, 0.4);
        }
        
        &.instagram:hover {
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
          box-shadow: 0 5px 20px rgba(225, 48, 108, 0.4);
        }
        
        &.twitter:hover {
          background: #1da1f2;
          box-shadow: 0 5px 20px rgba(29, 161, 242, 0.4);
        }
        
        &.youtube:hover {
          background: #ff0000;
          box-shadow: 0 5px 20px rgba(255, 0, 0, 0.4);
        }
        
        &.linkedin:hover {
          background: #0077b5;
          box-shadow: 0 5px 20px rgba(0, 119, 181, 0.4);
        }
        
        &.discord:hover {
          background: #5865f2;
          box-shadow: 0 5px 20px rgba(88, 101, 242, 0.4);
        }
      }
    }
  }

  /* Quick Links Column */
  .links-col {
    .quick-links {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        margin-bottom: 1.2rem;
        
        a {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.4rem;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          
          &:hover {
            color: #CD853F;
            padding-left: 0.8rem;
          }
          
          &::before {
            content: '→';
            opacity: 0;
            transition: all 0.3s ease;
          }
          
          &:hover::before {
            opacity: 1;
          }
        }
      }
    }
  }

  /* Footer Bottom */
  .footer-bottom {
    margin-top: 5rem;
    
    hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      margin-bottom: 2.5rem;
    }
    
    .bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 3rem 3rem 3rem;
      max-width: 130rem;
      margin: 0 auto;
      
      .copyright {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.3rem;
      }
      
      .bottom-links {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        
        a {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.3rem;
          text-decoration: none;
          transition: color 0.3s ease;
          
          &:hover {
            color: #CD853F;
          }
        }
        
        .divider {
          color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .footer-grid {
      grid-template-columns: 1fr 1fr;
      gap: 4rem 3rem;
    }
  }

  @media (max-width: 768px) {
    .cta-card {
      flex-direction: column;
      text-align: center;
      padding: 3rem 2.5rem;
      transform: translateY(30%);
      
      .cta-content {
        h2 {
          font-size: 2rem;
        }
        
        p {
          font-size: 1.3rem;
        }
      }
    }

    footer {
      padding: 10rem 0 0 0;
    }

    .footer-grid {
      grid-template-columns: 1fr;
      gap: 3.5rem;
      text-align: center;
    }

    .footer-col {
      h4::after {
        left: 50%;
        transform: translateX(-50%);
      }
    }

    .about-col {
      .contact-info {
        align-items: center;
      }
    }

    .social-col {
      .social-icons {
        justify-content: center;
      }
    }

    .links-col {
      .quick-links li a {
        justify-content: center;
        
        &:hover {
          padding-left: 0;
        }
        
        &::before {
          display: none;
        }
      }
    }

    .footer-bottom {
      .bottom-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
        padding: 0 2rem 2.5rem 2rem;
      }
    }
  }

  @media (max-width: 480px) {
    .cta-section {
      padding: 0 1.5rem;
    }

    .cta-card {
      padding: 2.5rem 2rem;
      border-radius: 1.5rem;
      
      .cta-btn {
        padding: 1.2rem 2.5rem;
        font-size: 1.4rem;
      }
    }

    .footer-container {
      padding: 0 2rem;
    }

    .social-col .social-icons .social-icon {
      width: 4rem;
      height: 4rem;
      font-size: 1.6rem;
    }
  }
`;

export default Footer;