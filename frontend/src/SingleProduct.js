import styled from "styled-components";
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { notifyAddToCart, notifyAddToWishlist, notifyRemoveFromWishlist } from './utils/customToast';
import { useProductContext } from "./context/productContext";
import FormatPrice from "./Helpers/FormatPrice";
import PageNavigation from "./components/PageNavigation";
import { Container } from "./Container";
import { FiHeart, FiShare2, FiTruck, FiRefreshCw, FiShield, FiClock, FiCheckCircle, FiStar } from 'react-icons/fi'
import { useCartContext } from "./context/cart_context";
import { useWishlistContext } from "./context/wishlist_context";
import Star from "./components/Star";
import RelatedProducts from "./components/RelatedProducts";
import RecentlyViewed, { recordProductView } from "./components/RecentlyViewed";
import SocialShare from "./components/SocialShare";

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SingleProduct = () => {
  const {getSingleProduct, isSingleLoading, singleProduct} = useProductContext();
  const { addToCart } = useCartContext();
  const { user } = useUser();
const navigate = useNavigate();
const [selectedImage, setSelectedImage] = useState(0);
const [amount, setAmount] = useState(1);
const [selectedWeight, setSelectedWeight] = useState(null);
const {id} = useParams();
const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

// Review states
const [userReviews, setUserReviews] = useState([]);
const [reviewRating, setReviewRating] = useState(5);
const [hoverRating, setHoverRating] = useState(0);
const [reviewComment, setReviewComment] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

// Mock reviews for display
const mockReviews = [
  {
    _id: 'mock1',
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Absolutely fresh and delicious! The cashews are perfectly roasted and the quality is outstanding. Will definitely order again.',
    createdAt: new Date('2025-12-28'),
    avatar: 'PS'
  },
  {
    _id: 'mock2',
    name: 'Rahul Desai',
    rating: 4,
    comment: 'Great taste and packaging. These cashews are premium quality. Slightly expensive but worth it for the freshness.',
    createdAt: new Date('2025-12-15'),
    avatar: 'RD'
  },
  {
    _id: 'mock3',
    name: 'Ananya Patel',
    rating: 5,
    comment: 'Best cashews I have bought online! Rich flavor, crunchy texture, and arrived well-packaged. Highly recommend!',
    createdAt: new Date('2025-12-10'),
    avatar: 'AP'
  }
];

// Calculate review statistics
const calculateReviewStats = () => {
  const allReviews = [...userReviews, ...mockReviews];
  const totalReviews = allReviews.length;
  if (totalReviews === 0) return { average: 0, distribution: [0, 0, 0, 0, 0], total: 0 };
  
  const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
  const average = (sum / totalReviews).toFixed(1);
  
  const distribution = [0, 0, 0, 0, 0];
  allReviews.forEach(review => {
    distribution[5 - review.rating]++;
  });
  
  return { average, distribution, total: totalReviews };
};
  
  // Fix: singleProduct should be an object, not an array
  const productData = singleProduct || {};
  const {
    id: productId,
    image,
    name,
    company,
    description,
    category,
    stock,
    rating,
    numReviews,
    reviews: productReviews,
    price,
    variants,
    defaultWeight,
    priceUnit,
  } = productData;

  // Get the currently selected variant (or default)
  const getSelectedVariant = () => {
    if (!variants || variants.length === 0) return null;
    const weightToFind = selectedWeight || defaultWeight || variants[0]?.weight;
    return variants.find(v => v.weight === weightToFind) || variants[0];
  };

  const selectedVariant = getSelectedVariant();
  const displayPrice = selectedVariant ? selectedVariant.price : price;
  const variantStock = selectedVariant ? selectedVariant.stock : stock;

  // Scroll to top when product page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    getSingleProduct(id);
  }, [id]);

  // Set default weight when product loads
  useEffect(() => {
    if (variants && variants.length > 0) {
      setSelectedWeight(defaultWeight || variants[0]?.weight);
    }
  }, [variants, defaultWeight]);

  // Record product view when product is loaded
  useEffect(() => {
    if (id && productData && productData.id && productData.name) {
      // Pass full product data for localStorage storage
      recordProductView({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.image,
        category: productData.category
      }, user?.id);
    }
  }, [id, productData?.id, productData?.name, user?.id]);

  // Fetch reviews when product changes
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API}/products/${id}/reviews`);
        setUserReviews(response.data.reviews || []);
      } catch (error) {
        // Reviews fetch failed - show empty list
      }
    };
    if (id) {
      fetchReviews();
    }
  }, [id]);

  // Submit review handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit a review');
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send payload matching MongoDB schema expectations
      const reviewPayload = {
        rating: reviewRating,
        comment: reviewComment.trim(),
        name: user.fullName || user.firstName || 'Anonymous User',
        userClerkId: user.id
      };
      
      const response = await axios.post(`${API}/products/${id}/reviews`, reviewPayload);
      
      toast.success('Review submitted successfully!');
      
      // Reset form
      setReviewComment('');
      setReviewRating(5);
      
      // Refetch product data from MongoDB to get updated reviews and rating
      await getSingleProduct(id);
      
      // Update local reviews state with fresh data
      const reviewsResponse = await axios.get(`${API}/products/${id}/reviews`);
      setUserReviews(reviewsResponse.data.reviews || []);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user already reviewed
  const hasUserReviewed = user && userReviews.some(r => r.userClerkId === user.id);

  if(isSingleLoading){
    return <div className="page_loading">Loading.....</div>
  }

  if(!productData.id) {
    return <div className="page_loading">Product not found</div>
  }
  // Calculate original price (MRP) based on selected variant price
  // MRP is 20% higher than the selling price for discount display
  const originalPrice = displayPrice ? Math.ceil(displayPrice * 1.2) : 0;
  const discount = originalPrice && displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  // Quantity handlers
  const setDecrease = () => {
    amount > 1 ? setAmount(amount - 1) : setAmount(1);
  };

  const setIncrease = () => {
    amount < stock ? setAmount(amount + 1) : setAmount(stock);
  };

  // Wishlist handler
const handleWishlist = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(id);
      notifyRemoveFromWishlist(); // 🔴 Red toast with trash icon
    } else {
      addToWishlist(productData);
      notifyAddToWishlist(); // 🟢 Green toast with checkmark
    }
  };

  // Share handler
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Check out this amazing product: ${name}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  // Enhanced product descriptions based on category
  const getEnhancedDescription = () => {
    const baseDescription = description || "Premium quality product from Sawaikar's Cashew Store.";
    
    const categoryDescriptions = {
      'cashews': `${baseDescription} Our cashews are carefully selected from the finest orchards and processed using traditional methods to preserve their natural flavor and nutritional value. Rich in healthy fats, protein, and essential minerals like magnesium and zinc. Perfect for snacking, cooking, or as a healthy addition to your meals.`,
      'nuts': `${baseDescription} These premium nuts are sourced directly from trusted farmers and undergo rigorous quality checks. Packed with essential nutrients, healthy fats, and antioxidants that support heart health and overall wellness. Ideal for daily consumption as part of a balanced diet.`,
      'dry fruits': `${baseDescription} Our dry fruits are naturally sun-dried to retain maximum nutrition and flavor. These nutrient-dense treats are rich in fiber, vitamins, and minerals. Perfect for a quick energy boost, healthy snacking, or adding natural sweetness to your recipes.`,
      'snacks': `${baseDescription} Made with the finest ingredients and traditional recipes, these snacks offer the perfect blend of taste and nutrition. Free from artificial preservatives and additives. Great for on-the-go snacking, office treats, or entertaining guests.`
    };
    
    const categoryKey = category?.toLowerCase() || 'default';
    return categoryDescriptions[categoryKey] || categoryDescriptions['nuts'];
  };

  // Add to Cart handler with navigation (BUY NOW button)
  const handleAddToCart = () => {
    // Get default color (first available color or default)
    const defaultColor = productData.colors && productData.colors.length > 0 ? productData.colors[0] : "Red";
    
    // Include weight and correct variant price in product data for cart
    const productWithWeight = {
      ...productData,
      selectedWeight: selectedWeight,
      price: displayPrice // Use the selected variant price
    };
    
    // Add item to cart with correct variant price
    addToCart(id, defaultColor, amount, productWithWeight);
    
    // Show toast notification
    notifyAddToCart(); // 🟢 Green toast with checkmark
    
    // Navigate to cart page
    navigate('/cart');
  };

  return (
    <Wrapper>
      <PageNavigation title={name} />
      <Container className="container">
        <div className="product-layout">
          {/* Product Images Section */}
          <div className="product-images-section">
            <div className="image-gallery">
              <div className="thumbnail-list">
                {image && image.length > 0 && image.map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${name} ${index + 1}`} />
                  </div>
                ))}
              </div>
              <div className="main-image">
                {image && image.length > 0 && (
                  <img 
                    src={image[selectedImage]} 
                    alt={name} 
                    className="featured-image"
                  />
                )}
              </div>
            </div>
            <div className="image-actions">
              <button 
                className={`action-btn ${isInWishlist(id) ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
              >
                <FiHeart /> {isInWishlist(id) ? 'Added to Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="action-btn" onClick={handleShare}>
                <FiShare2 /> Share
              </button>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="product-details-section">
            <div className="product-header">
              <h1 className="product-title">{name}</h1>
              <div className="product-rating">
                <Star stars={rating || 0} reviews={numReviews || 0}/>
              </div>
            </div>

            <div className="pricing-section">
              <div className="price-container">
                <span className="current-price">
                  <FormatPrice price={displayPrice}/>
                  {selectedVariant && <span className="weight-label">/ {selectedVariant.weight}</span>}
                </span>
                {originalPrice > 0 && (
                  <>
                    <span className="original-price">
                      MRP: <del><FormatPrice price={originalPrice}/></del>
                    </span>
                    <span className="discount-badge">{discount}% off</span>
                  </>
                )}
              </div>
              <p className="deal-text">Deal of the Day: <FormatPrice price={displayPrice}/></p>
            </div>

            {/* Weight/Size Selector */}
            {variants && variants.length > 0 && (
              <div className="weight-selector-section">
                <h4>Select Pack Size:</h4>
                <div className="weight-options">
                  {variants.map((variant, index) => (
                    <button
                      key={index}
                      className={`weight-option ${selectedWeight === variant.weight ? 'selected' : ''} ${variant.stock <= 0 ? 'out-of-stock' : ''}`}
                      onClick={() => variant.stock > 0 && setSelectedWeight(variant.weight)}
                      disabled={variant.stock <= 0}
                    >
                      <span className="weight-value">{variant.weight}</span>
                      <span className="weight-price"><FormatPrice price={variant.price} /></span>
                      {variant.stock <= 0 && <span className="stock-badge">Out of Stock</span>}
                      {variant.stock > 0 && variant.stock <= 10 && (
                        <span className="stock-badge low">Only {variant.stock} left</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-info">
              <div className="availability-info">
                <p className={`stock-status ${variantStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  Available: <span>{variantStock > 0 ? "In Stock" : "Not Available"}</span>
                </p>
                <p>Product ID: <span>{id}</span></p>
                <p>Brand: <span>{company}</span></p>
                <p>Category: <span>{category}</span></p>
              </div>
            </div>

            <div className="product-description">
              <h3>About this item</h3>
              <p>{getEnhancedDescription()}</p>
              <ul className="product-highlights">
                <li>
                  <FiCheckCircle className="check-icon" />
                  <span>Hand-picked and quality assured</span>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <span>Authentic product with natural taste</span>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <span>Rich in essential nutrients and healthy fats</span>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <span>Perfect for snacking and cooking</span>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <span>Hygienically packed for freshness</span>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <span>No artificial preservatives or additives</span>
                </li>
              </ul>
            </div>

            {/* Policies Section - Trust Badges */}
            <div className="policies-section" style={{ marginBottom: '2rem' }}>
              <div className="policy-item">
                <FiTruck className="policy-icon" />
                <div>
                  <h5>Free Delivery</h5>
                  <p>Orders above ₹2000</p>
                </div>
              </div>
              <div className="policy-item">
                <FiRefreshCw className="policy-icon" />
                <div>
                  <h5>30 Days Return</h5>
                  <p>Easy returns</p>
                </div>
              </div>
              <div className="policy-item">
                <FiShield className="policy-icon" />
                <div>
                  <h5>Secure Payment</h5>
                  <p>100% protected</p>
                </div>
              </div>
            </div>

            {/* Add to Cart Section */}
            {(variantStock > 0 || stock > 0) && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <h4>Quantity:</h4>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={setDecrease}
                      disabled={amount <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{amount}</span>
                    <button 
                      className="quantity-btn"
                      onClick={setIncrease}
                      disabled={amount >= (variantStock || stock)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="action-buttons">
                  <button 
                    className="add-to-cart-btn outlined"
                    onClick={() => {
                      const defaultColor = productData.colors && productData.colors.length > 0 ? productData.colors[0] : "Red";
                      // Include weight in product data for cart
                      const productWithWeight = {
                        ...productData,
                        selectedWeight: selectedWeight,
                        price: displayPrice // Use the selected variant price
                      };
                      addToCart(id, defaultColor, amount, productWithWeight);
                      toast.success(`Added ${selectedWeight || ''} pack to cart!`);
                    }}
                  >
                    ADD TO CART
                  </button>
                  <button 
                    className="add-to-cart-btn filled"
                    onClick={handleAddToCart}
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            )}
            
            {/* Social Share */}
            <SocialShare product={singleProduct} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Customer Reviews</h2>
          
          {/* Review Summary Dashboard */}
          <div className="review-summary-dashboard">
            <div className="average-rating-box">
              <div className="average-score">{calculateReviewStats().average}</div>
              <div className="stars-display">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={i < Math.round(calculateReviewStats().average) ? 'star filled' : 'star'}
                  />
                ))}
              </div>
              <div className="total-reviews">{calculateReviewStats().total} reviews</div>
            </div>
            
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star, index) => {
                const count = calculateReviewStats().distribution[index];
                const percentage = calculateReviewStats().total > 0 
                  ? (count / calculateReviewStats().total) * 100 
                  : 0;
                return (
                  <div key={star} className="distribution-row">
                    <span className="star-label">{star} ★</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="count-label">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Form - Only visible when signed in */}
          <SignedIn>
            {!hasUserReviewed ? (
              <div className="write-review-card">
                <h3>Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="star-rating-input">
                    <label>Your Rating</label>
                    <div className="interactive-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={
                            star <= (hoverRating || reviewRating)
                              ? 'star-icon active'
                              : 'star-icon'
                          }
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="review-textarea">
                    <label>Your Review</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows="4"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="submit-review-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="already-reviewed">
                <p>✅ You have already reviewed this product</p>
              </div>
            )}
          </SignedIn>
          
          <SignedOut>
            <div className="sign-in-prompt">
              <p>Please <a href="/login">sign in</a> to write a review</p>
            </div>
          </SignedOut>

          {/* Reviews List with Mock Data */}
          <div className="reviews-list">
            {[...userReviews, ...mockReviews].map((review, index) => (
              <div key={review._id || index} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="avatar">{review.avatar || review.name?.substring(0, 2).toUpperCase()}</div>
                    <div>
                      <span className="reviewer-name">{review.name}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={i < review.rating ? 'star filled' : 'star empty'}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
      
      {/* Related Products Section */}
      <RelatedProducts productId={id} />
      
      {/* Recently Viewed Products Section */}
      <RecentlyViewed />
    </Wrapper>
  );
}


const Wrapper = styled.section`
  .container {
    padding: 2rem 0;
    max-width: 140rem;
    margin: 0 auto;
  }

  .product-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;
  }

  /* Image Gallery Section */
  .product-images-section {
    .image-gallery {
      display: flex;
      gap: 1rem;
      
      .thumbnail-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        
        .thumbnail {
          width: 8rem;
          height: 8rem;
          border: 2px solid transparent;
          border-radius: 0.5rem;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          
          &.active {
            border-color: ${({ theme }) => theme.colors.helper};
          }
          
          &:hover {
            border-color: ${({ theme }) => theme.colors.btn};
          }
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
      
      .main-image {
        flex: 1;
        
        .featured-image {
          width: 100%;
          max-width: 50rem;
          height: auto;
          border-radius: 1rem;
          box-shadow: ${({ theme }) => theme.colors.shadowSupport};
        }
      }
    }
    
    .image-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 2rem;
        border: 1px solid ${({ theme }) => theme.colors.border};
        background: white;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.4rem;
        
        &:hover {
          background: ${({ theme }) => theme.colors.bg};
          border-color: ${({ theme }) => theme.colors.helper};
        }
        
        &.wishlisted {
          background: ${({ theme }) => theme.colors.helper};
          color: white;
          border-color: ${({ theme }) => theme.colors.helper};
          
          &:hover {
            background: ${({ theme }) => theme.colors.btn};
            border-color: ${({ theme }) => theme.colors.btn};
          }
        }
      }
    }
  }

  /* Product Details Section */
  .product-details-section {
    .product-header {
      margin-bottom: 2rem;
      
      .product-title {
        font-size: 2.4rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.heading};
        margin-bottom: 1rem;
        line-height: 1.3;
      }
      
      .product-rating {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        
        .review-count {
          color: ${({ theme }) => theme.colors.text};
          font-size: 1.4rem;
        }
      }
    }

    .pricing-section {
      margin-bottom: 2rem;
      padding: 2rem;
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 1rem;
      border: 1px solid ${({ theme }) => theme.colors.border};
      
      .price-container {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        
        .current-price {
          font-size: 2.8rem;
          font-weight: 700;
          color: ${({ theme }) => theme.colors.helper};
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          
          .weight-label {
            font-size: 1.4rem;
            font-weight: 500;
            color: ${({ theme }) => theme.colors.text};
          }
        }
        
        .original-price {
          font-size: 1.8rem;
          color: ${({ theme }) => theme.colors.text};
          
          del {
            color: #999;
          }
        }
        
        .discount-badge {
          background: #ff4d4f;
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 0.4rem;
          font-size: 1.2rem;
          font-weight: 600;
        }
      }
      
      .deal-text {
        font-size: 1.6rem;
        color: ${({ theme }) => theme.colors.btn};
        font-weight: 600;
      }
    }

    /* Weight Selector Section */
    .weight-selector-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 1rem;
      border: 1px solid ${({ theme }) => theme.colors.border};
      
      h4 {
        font-size: 1.6rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.heading};
        margin-bottom: 1rem;
      }
      
      .weight-options {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        
        .weight-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.2rem 2rem;
          min-width: 100px;
          border: 2px solid ${({ theme }) => theme.colors.border};
          border-radius: 1rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          
          &:hover:not(.out-of-stock) {
            border-color: ${({ theme }) => theme.colors.helper};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
          }
          
          &.selected {
            border-color: ${({ theme }) => theme.colors.helper};
            background: linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%);
            box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
            
            &::after {
              content: '✓';
              position: absolute;
              top: -8px;
              right: -8px;
              width: 24px;
              height: 24px;
              background: ${({ theme }) => theme.colors.helper};
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.2rem;
              font-weight: bold;
            }
          }
          
          &.out-of-stock {
            opacity: 0.5;
            cursor: not-allowed;
            background: #f5f5f5;
          }
          
          .weight-value {
            font-size: 1.6rem;
            font-weight: 700;
            color: ${({ theme }) => theme.colors.heading};
            margin-bottom: 0.3rem;
          }
          
          .weight-price {
            font-size: 1.4rem;
            font-weight: 600;
            color: ${({ theme }) => theme.colors.helper};
          }
          
          .stock-badge {
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.2rem 0.6rem;
            font-size: 1rem;
            border-radius: 4px;
            white-space: nowrap;
            background: #dc3545;
            color: white;
            
            &.low {
              background: #ffc107;
              color: #333;
            }
          }
        }
      }
    }

    .product-info {
      margin-bottom: 2rem;
      
      .availability-info {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        
        p {
          font-size: 1.5rem;
          
          span {
            font-weight: 600;
            color: ${({ theme }) => theme.colors.heading};
          }
        }
        
        .stock-status {
          &.in-stock span {
            color: #52c41a;
          }
          
          &.out-of-stock span {
            color: #ff4d4f;
          }
        }
      }
    }

    .product-description {
      margin-bottom: 2rem;
      
      h3 {
        font-size: 1.8rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: ${({ theme }) => theme.colors.heading};
      }
      
      p {
        font-size: 1.5rem;
        line-height: 1.6;
        color: ${({ theme }) => theme.colors.text};
        margin-bottom: 1.5rem;
      }
      
      .product-highlights {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
        
        li {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          font-size: 1.4rem;
          color: ${({ theme }) => theme.colors.text};
          line-height: 1.6;
          
          .check-icon {
            flex-shrink: 0;
            width: 1.8rem;
            height: 1.8rem;
            margin-top: 0.2rem;
            color: ${({ theme }) => theme.colors.helper};
          }
          
          span {
            flex: 1;
          }
        }
      }
    }

    .product-features {
      margin-bottom: 3rem;
      
      .feature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border: 1px solid ${({ theme }) => theme.colors.border};
          border-radius: 0.8rem;
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: ${({ theme }) => theme.colors.shadowSupport};
            border-color: ${({ theme }) => theme.colors.helper};
          }
          
          .feature-emoji {
            font-size: 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 5rem;
            height: 5rem;
            background: ${({ theme }) => theme.colors.bg};
            border-radius: 50%;
            flex-shrink: 0;
          }
          
          .feature-icon {
            font-size: 2.4rem;
            color: ${({ theme }) => theme.colors.helper};
            background: ${({ theme }) => theme.colors.bg};
            padding: 1rem;
            border-radius: 50%;
          }
          
          div {
            h4 {
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 0.4rem;
              color: ${({ theme }) => theme.colors.heading};
            }
            
            p {
              font-size: 1.2rem;
              color: ${({ theme }) => theme.colors.text};
            }
          }
        }
      }
    }

    .add-to-cart-section {
      
      .quantity-selector {
        margin-bottom: 1.5rem;
        
        h4 {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.8rem;
          color: ${({ theme }) => theme.colors.text};
          text-transform: uppercase;
          letter-spacing: 0.1rem;
          opacity: 0.7;
        }
        
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1.5px solid ${({ theme }) => theme.colors.border};
          border-radius: 0.8rem;
          overflow: hidden;
          width: fit-content;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;

          &:hover {
            border-color: ${({ theme }) => theme.colors.helper};
            box-shadow: 0 2px 6px rgba(139, 69, 19, 0.1);
          }
          
          .quantity-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 4.5rem;
            height: 4.5rem;
            border: none;
            background: transparent;
            color: ${({ theme }) => theme.colors.text};
            font-size: 1.8rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover:not(:disabled) {
              background: ${({ theme }) => theme.colors.bg};
              color: ${({ theme }) => theme.colors.helper};
            }
            
            &:active:not(:disabled) {
              transform: scale(0.95);
            }
            
            &:disabled {
              opacity: 0.3;
              cursor: not-allowed;
            }
            
            &:first-child {
              border-right: 1px solid ${({ theme }) => theme.colors.border};
            }
            
            &:last-child {
              border-left: 1px solid ${({ theme }) => theme.colors.border};
            }
          }
          
          .quantity-display {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 5rem;
            height: 4.5rem;
            padding: 0 1rem;
            background: transparent;
            font-size: 1.6rem;
            font-weight: 600;
            color: ${({ theme }) => theme.colors.heading};
          }
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 1.2rem;
        
        .add-to-cart-btn {
          flex: 1;
          padding: 0;
          height: 4.5rem;
          border-radius: 0.8rem;
          font-size: 1.4rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.08rem;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.outlined {
            background: white;
            color: ${({ theme }) => theme.colors.btn};
            border: 2px solid ${({ theme }) => theme.colors.btn};
            
            &:hover {
              background: ${({ theme }) => theme.colors.bg};
              box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
            }

            &:active {
              transform: scale(0.98);
            }
          }
          
          &.filled {
            background: linear-gradient(135deg, ${({ theme }) => theme.colors.btn}, ${({ theme }) => theme.colors.helper});
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
            
            &:hover {
              box-shadow: 0 6px 20px rgba(139, 69, 19, 0.35);
              transform: translateY(-1px);
            }

            &:active {
              transform: scale(0.98);
            }
          }
        }
      }
    }

    /* Policies Section - Trust Badges */
    .policies-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;

      .policy-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.2rem;
        background: rgba(255, 247, 237, 0.4);
        border: 1px solid rgba(251, 146, 60, 0.15);
        border-radius: 0.6rem;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 247, 237, 0.6);
          border-color: rgba(251, 146, 60, 0.25);
        }

        .policy-icon {
          font-size: 2rem;
          color: ${({ theme }) => theme.colors.helper};
          flex-shrink: 0;
        }

        h5 {
          font-size: 1.2rem;
          font-weight: 600;
          color: ${({ theme }) => theme.colors.heading};
          margin-bottom: 0.2rem;
        }

        p {
          font-size: 1rem;
          color: ${({ theme }) => theme.colors.text};
          opacity: 0.75;
          margin: 0;
        }
      }
    }
  }

  /* Responsive Design */
  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .product-layout {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .product-images-section {
      .image-gallery {
        flex-direction: column;
        
        .thumbnail-list {
          flex-direction: row;
          justify-content: center;
          order: 2;
        }
        
        .main-image {
          order: 1;
          text-align: center;
        }
      }
    }
    
    .product-details-section {
      .product-features .feature-grid {
        grid-template-columns: 1fr;
      }
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .container {
      padding: 1rem;
    }
    
    .product-layout {
      gap: 1.5rem;
    }
    
    .product-details-section {
      .product-header .product-title {
        font-size: 2rem;
      }
      
      .pricing-section {
        padding: 1.5rem;
        
        .price-container .current-price {
          font-size: 2.4rem;
        }
      }
      
      .product-features .feature-grid {
        .feature-item {
          padding: 1rem;
          
          .feature-icon {
            font-size: 2rem;
            padding: 0.8rem;
          }
        }
      }

      .add-to-cart-section .action-buttons {
        flex-direction: column;
        gap: 1rem;
      }

      .policies-section {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  }

  /* Reviews Section Styles */
  .reviews-section {
    margin-top: 4rem;
    padding-top: 3rem;
    border-top: 2px solid rgba(249, 115, 22, 0.1);
    
    .reviews-title {
      font-size: 2.4rem;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 2.5rem;
      font-weight: 700;
    }
    
    /* Review Summary Dashboard */
    .review-summary-dashboard {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 3rem;
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border: 1px solid rgba(249, 115, 22, 0.2);
      border-radius: 1.2rem;
      padding: 2.5rem;
      margin-bottom: 3rem;
      
      .average-rating-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        
        .average-score {
          font-size: 4.5rem;
          font-weight: 700;
          color: #f97316;
          line-height: 1;
          margin-bottom: 1rem;
        }
        
        .stars-display {
          display: flex;
          gap: 0.3rem;
          margin-bottom: 0.8rem;
          
          .star {
            font-size: 2rem;
            color: #e0e0e0;
            
            &.filled {
              color: #fbbf24;
              fill: #fbbf24;
            }
          }
        }
        
        .total-reviews {
          font-size: 1.3rem;
          color: #6b7280;
          font-weight: 500;
        }
      }
      
      .rating-distribution {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        justify-content: center;
        
        .distribution-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .star-label {
            min-width: 3.5rem;
            font-size: 1.3rem;
            font-weight: 500;
            color: ${({ theme }) => theme.colors.text};
          }
          
          .progress-bar {
            flex: 1;
            height: 0.8rem;
            background: #e5e7eb;
            border-radius: 0.4rem;
            overflow: hidden;
            
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #fbbf24, #f59e0b);
              border-radius: 0.4rem;
              transition: width 0.3s ease;
            }
          }
          
          .count-label {
            min-width: 2.5rem;
            font-size: 1.2rem;
            color: #9ca3af;
            text-align: right;
          }
        }
      }
    }
    
    .write-review-card {
      background: rgba(255, 247, 237, 0.5);
      border: 1.5px solid rgba(249, 115, 22, 0.2);
      border-radius: 1.2rem;
      padding: 2.5rem;
      margin-bottom: 3rem;
      
      h3 {
        font-size: 1.8rem;
        color: ${({ theme }) => theme.colors.heading};
        margin-bottom: 2rem;
        font-weight: 600;
      }
      
      .star-rating-input {
        margin-bottom: 2rem;
        
        label {
          display: block;
          font-size: 1.3rem;
          color: ${({ theme }) => theme.colors.text};
          margin-bottom: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          opacity: 0.8;
        }
        
        .interactive-stars {
          display: flex;
          gap: 0.8rem;
          
          .star-icon {
            font-size: 3rem;
            color: #e5e7eb;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              transform: scale(1.1);
            }
            
            &.active {
              color: #fbbf24;
              fill: #fbbf24;
            }
          }
        }
      }
      
      .review-textarea {
        margin-bottom: 2rem;
        
        label {
          display: block;
          font-size: 1.3rem;
          color: ${({ theme }) => theme.colors.text};
          margin-bottom: 1rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          opacity: 0.8;
        }
        
        textarea {
          width: 100%;
          padding: 1.4rem;
          border: 1.5px solid rgba(249, 115, 22, 0.2);
          border-radius: 0.8rem;
          font-size: 1.4rem;
          font-family: inherit;
          resize: vertical;
          background: white;
          transition: all 0.2s ease;
          
          &:focus {
            outline: none;
            border-color: #f97316;
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
          }
          
          &::placeholder {
            color: #9ca3af;
          }
        }
      }
      
      .submit-review-btn {
        background: linear-gradient(135deg, #f97316, #ea580c);
        color: white;
        border: none;
        padding: 0;
        height: 4.5rem;
        padding: 0 3rem;
        font-size: 1.4rem;
        font-weight: 600;
        border-radius: 0.8rem;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.08rem;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
        
        &:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
    
    .already-reviewed {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 0.8rem;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      
      p {
        font-size: 1.4rem;
        color: #166534;
        margin: 0;
      }
    }
    
    .sign-in-prompt {
      background: #fef3cd;
      border: 1px solid #ffc107;
      border-radius: 0.8rem;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      
      p {
        font-size: 1.4rem;
        color: #856404;
        margin: 0;
        
        a {
          color: #f97316;
          font-weight: 600;
          text-decoration: underline;
          
          &:hover {
            color: #ea580c;
          }
        }
      }
    }
    
    .reviews-list {
      .review-card {
        background: white;
        border: 1px solid #f3f4f6;
        border-radius: 1rem;
        padding: 2.5rem;
        margin-bottom: 1.5rem;
        transition: all 0.2s ease;
        
        &:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          border-color: rgba(249, 115, 22, 0.2);
        }
        
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.2rem;
          
          .reviewer-info {
            display: flex;
            gap: 1.2rem;
            align-items: center;
            
            .avatar {
              width: 4.5rem;
              height: 4.5rem;
              border-radius: 50%;
              background: linear-gradient(135deg, #f97316, #ea580c);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
              font-weight: 600;
              flex-shrink: 0;
            }
            
            div {
              display: flex;
              flex-direction: column;
              gap: 0.3rem;
              
              .reviewer-name {
                font-size: 1.5rem;
                font-weight: 600;
                color: ${({ theme }) => theme.colors.heading};
              }
              
              .review-date {
                font-size: 1.2rem;
                color: #9ca3af;
              }
            }
          }
          
          .review-rating {
            display: flex;
            gap: 0.3rem;
            
            .star {
              font-size: 1.6rem;
              
              &.filled {
                color: #fbbf24;
                fill: #fbbf24;
              }
              
              &.empty {
                color: #e5e7eb;
              }
            }
          }
        }
        
        .review-comment {
          font-size: 1.4rem;
          line-height: 1.7;
          color: ${({ theme }) => theme.colors.text};
          margin: 0;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .reviews-section {
      margin-top: 3rem;
      padding-top: 2rem;
      
      .write-review-card {
        padding: 1.5rem;
        
        .star-rating-input .star-selector .star-icon {
          font-size: 2rem;
        }
      }
      
      .reviews-list .review-card {
        padding: 1.5rem;
      }
    }
  }
`;

export default SingleProduct;
