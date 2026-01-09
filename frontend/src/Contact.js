import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { MdLocationOn, MdEmail, MdPhone, MdAccessTime, MdSend } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const Contact = () => {
  const { isSignedIn, user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with user data when signed in
  useEffect(() => {
    if (isSignedIn && user && !initialized) {
      setFormData({
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        subject: "",
        message: "",
      });
      setInitialized(true);
    }
  }, [isSignedIn, user, initialized]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xdojzzlj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-container">
        <div className="contact-grid">
          {/* Left Column - Contact Info */}
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p className="info-subtitle">
              Reach out to us through any of these channels. We're here to help!
            </p>

            <div className="info-cards">
              {/* Location Card */}
              <div className="info-card">
                <div className="icon-wrapper location">
                  <MdLocationOn />
                </div>
                <div className="card-content">
                  <h3>Visit Us</h3>
                  <p>Sawaikar's Goan Cashews</p>
                  <p>Mapusa, Goa 403507</p>
                  <p>India</p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="info-card">
                <div className="icon-wrapper phone">
                  <MdPhone />
                </div>
                <div className="card-content">
                  <h3>Call Us</h3>
                  <p>+91 98765 43210</p>
                  <p>+91 83209 12345</p>
                  <a href="tel:+919876543210" className="card-link">
                    Click to call
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div className="info-card">
                <div className="icon-wrapper email">
                  <MdEmail />
                </div>
                <div className="card-content">
                  <h3>Email Us</h3>
                  <p>info@sawaikarcashews.com</p>
                  <p>orders@sawaikarcashews.com</p>
                  <a href="mailto:info@sawaikarcashews.com" className="card-link">
                    Send an email
                  </a>
                </div>
              </div>

              {/* Hours Card */}
              <div className="info-card">
                <div className="icon-wrapper hours">
                  <MdAccessTime />
                </div>
                <div className="card-content">
                  <h3>Business Hours</h3>
                  <p>Monday - Saturday</p>
                  <p>9:00 AM - 7:00 PM IST</p>
                  <p className="closed">Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Contact */}
            <a
              href="https://wa.me/919876543210?text=Hello!%20I%20have%20a%20question%20about%20your%20cashews."
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              <FaWhatsapp />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-form-section">
            <div className="form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <MdSend />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <div className="map-header">
          <h2>Find Our Store</h2>
          <p>Visit us at our Goa location for the freshest cashews</p>
        </div>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3843.9710129813184!2d73.81429187415532!3d15.539684585065697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbfc1b3b2ada4bb%3A0xfc78326afeb77a6c!2sSawaikar&#39;s%20Goan%20Cashews%20And%20Dry%20Fruits-%20Best%20Cashews%20in%20Goa!5e0!3m2!1sen!2sin!4v1731958498680!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sawaikar's Cashew Store Location"
          ></iframe>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%);
    padding: 8rem 2rem 5rem;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 700px;
      margin: 0 auto;

      h1 {
        font-size: 3.5rem;
        font-weight: 700;
        color: #FFF8DC;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      p {
        font-size: 1.25rem;
        color: rgba(255, 248, 220, 0.9);
        line-height: 1.6;
      }
    }
  }

  /* Contact Container */
  .contact-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 5rem 2rem;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 4rem;
    align-items: start;
  }

  /* Contact Info Section */
  .contact-info {
    h2 {
      font-size: 2rem;
      color: #8B4513;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .info-subtitle {
      color: #666;
      font-size: 1rem;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }
  }

  .info-cards {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-card {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem;
    background: #FFF8DC;
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(139, 69, 19, 0.1);

    &:hover {
      transform: translateX(8px);
      box-shadow: 0 8px 25px rgba(139, 69, 19, 0.15);
    }

    .icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        font-size: 1.5rem;
        color: white;
      }

      &.location {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
      }
      &.phone {
        background: linear-gradient(135deg, #3498db, #2980b9);
      }
      &.email {
        background: linear-gradient(135deg, #CD853F, #A0522D);
      }
      &.hours {
        background: linear-gradient(135deg, #27ae60, #229954);
      }
    }

    .card-content {
      h3 {
        font-size: 1.1rem;
        color: #8B4513;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }

      p {
        color: #666;
        font-size: 0.95rem;
        line-height: 1.5;
        margin: 0;

        &.closed {
          color: #c0392b;
          font-weight: 500;
        }
      }

      .card-link {
        display: inline-block;
        margin-top: 0.5rem;
        color: #CD853F;
        font-weight: 500;
        font-size: 0.9rem;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #8B4513;
          text-decoration: underline;
        }
      }
    }
  }

  .whatsapp-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, #25D366, #128C7E);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);

    svg {
      font-size: 1.5rem;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
    }
  }

  /* Contact Form Section */
  .contact-form-section {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 10px 40px rgba(139, 69, 19, 0.1);
    border: 1px solid rgba(139, 69, 19, 0.1);

    .form-header {
      margin-bottom: 2rem;

      h2 {
        font-size: 1.75rem;
        color: #8B4513;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }

      p {
        color: #666;
        font-size: 0.95rem;
      }
    }
  }

  .contact-form {
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        font-size: 0.95rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
      }

      input,
      textarea {
        width: 100%;
        padding: 1rem 1.25rem;
        font-size: 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        background: #FAFAFA;
        transition: all 0.3s ease;
        font-family: inherit;
        text-transform: none;

        &::placeholder {
          color: #999;
        }

        &:focus {
          outline: none;
          border-color: #CD853F;
          background: white;
          box-shadow: 0 0 0 4px rgba(205, 133, 63, 0.1);
        }
      }

      textarea {
        resize: vertical;
        min-height: 140px;
      }
    }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 1.25rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #CD853F 0%, #8B4513 100%);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);

      svg {
        font-size: 1.25rem;
      }

      &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  /* Map Section */
  .map-section {
    background: #FFF8DC;
    padding: 4rem 2rem;

    .map-header {
      text-align: center;
      max-width: 600px;
      margin: 0 auto 2.5rem;

      h2 {
        font-size: 2rem;
        color: #8B4513;
        margin-bottom: 0.5rem;
        font-weight: 700;
      }

      p {
        color: #666;
        font-size: 1rem;
      }
    }

    .map-container {
      max-width: 1400px;
      margin: 0 auto;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(139, 69, 19, 0.15);

      iframe {
        display: block;
        filter: saturate(0.9) contrast(1.05);
      }
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .contact-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .contact-info {
      order: 2;
    }

    .contact-form-section {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 7rem 1.5rem 4rem;

      .hero-content {
        h1 {
          font-size: 2.5rem;
        }

        p {
          font-size: 1.1rem;
        }
      }
    }

    .contact-container {
      padding: 3rem 1.5rem;
    }

    .contact-form-section {
      padding: 2rem;
    }

    .contact-form {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }

    .info-card {
      padding: 1.25rem;

      &:hover {
        transform: none;
      }
    }

    .map-section {
      padding: 3rem 1.5rem;

      .map-container {
        border-radius: 12px;

        iframe {
          height: 350px;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .hero-section .hero-content h1 {
      font-size: 2rem;
    }

    .contact-form-section {
      padding: 1.5rem;
      border-radius: 15px;
    }

    .whatsapp-btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

export default Contact;