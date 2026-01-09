import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import FormatPrice from '../Helpers/FormatPrice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RelatedProducts = ({ productId, category, title = "You May Also Like", limit = 4 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/${productId}/related?limit=${limit + 2}`);
      const data = await res.json();
      
      if (res.ok) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(products.length - 4, prev + 1));
  };

  if (loading) {
    return (
      <Wrapper>
        <SectionTitle>{title}</SectionTitle>
        <LoadingGrid>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i}>
              <SkeletonImage />
              <SkeletonText width="80%" />
              <SkeletonText width="50%" />
            </SkeletonCard>
          ))}
        </LoadingGrid>
      </Wrapper>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + 4);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < products.length - 4;

  return (
    <Wrapper>
      <HeaderRow>
        <SectionTitle>{title}</SectionTitle>
        {products.length > 4 && (
          <NavigationButtons>
            <NavButton onClick={handlePrev} disabled={!canGoPrev}>
              <FiChevronLeft />
            </NavButton>
            <NavButton onClick={handleNext} disabled={!canGoNext}>
              <FiChevronRight />
            </NavButton>
          </NavigationButtons>
        )}
      </HeaderRow>

      <ProductGrid>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id}>
            <ImageWrapper to={`/singleproduct/${product.id}`}>
              <ProductImage 
                src={product.image?.[0] || '/images/placeholder.jpg'} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              {product.featured && <FeaturedBadge>Featured</FeaturedBadge>}
              <QuickActions>
                <ActionButton title="Add to Cart">
                  <FiShoppingCart />
                </ActionButton>
                <ActionButton title="Add to Wishlist">
                  <FiHeart />
                </ActionButton>
              </QuickActions>
            </ImageWrapper>

            <ProductInfo>
              <CategoryTag>{product.category}</CategoryTag>
              <ProductName to={`/singleproduct/${product.id}`}>
                {product.name}
              </ProductName>
              
              <RatingRow>
                <StarIcon><FiStar /></StarIcon>
                <Rating>{product.rating?.toFixed(1) || '0.0'}</Rating>
                <ReviewCount>({product.numReviews || 0})</ReviewCount>
              </RatingRow>

              <PriceRow>
                <Price><FormatPrice price={product.price} /></Price>
                {product.originalPrice && product.originalPrice > product.price && (
                  <OriginalPrice>
                    <FormatPrice price={product.originalPrice} />
                  </OriginalPrice>
                )}
              </PriceRow>

              {product.stock <= 10 && product.stock > 0 && (
                <LowStock>Only {product.stock} left!</LowStock>
              )}
              {product.stock === 0 && (
                <OutOfStock>Out of Stock</OutOfStock>
              )}
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductGrid>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 48px 0;
  background: linear-gradient(180deg, #fdfcfb 0%, #f8f6f3 100%);
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #8b5a2b;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #8b5a2b, #d4a76a);
    border-radius: 3px;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const NavButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #8b5a2b;
  background: white;
  color: #8b5a2b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #8b5a2b;
    color: white;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 0 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(139, 90, 43, 0.15);
  }
`;

const ImageWrapper = styled(NavLink)`
  position: relative;
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f6f3;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;

  ${ProductCard}:hover & {
    transform: scale(1.08);
  }
`;

const FeaturedBadge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const QuickActions = styled.div`
  position: absolute;
  right: 12px;
  top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;

  ${ProductCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: #666;

  &:hover {
    background: #8b5a2b;
    color: white;
    transform: scale(1.1);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProductInfo = styled.div`
  padding: 16px;
`;

const CategoryTag = styled.span`
  display: inline-block;
  background: rgba(139, 90, 43, 0.1);
  color: #8b5a2b;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const ProductName = styled(NavLink)`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  text-decoration: none;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &:hover {
    color: #8b5a2b;
  }
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
`;

const StarIcon = styled.span`
  color: #fbbf24;
  display: flex;
  align-items: center;

  svg {
    fill: #fbbf24;
    width: 14px;
    height: 14px;
  }
`;

const Rating = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
`;

const ReviewCount = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #8b5a2b;
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const LowStock = styled.span`
  display: inline-block;
  margin-top: 8px;
  color: #f59e0b;
  font-size: 0.8rem;
  font-weight: 600;
`;

const OutOfStock = styled.span`
  display: inline-block;
  margin-top: 8px;
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 600;
`;

// Skeleton loading styles
const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 0 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const SkeletonImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  margin-bottom: 12px;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const SkeletonText = styled.div`
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: ${props => props.width || '100%'};
`;

export default RelatedProducts;
