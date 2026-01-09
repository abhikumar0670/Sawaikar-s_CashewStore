import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiClock, FiX, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '@clerk/clerk-react';
import FormatPrice from '../Helpers/FormatPrice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RecentlyViewed = ({ limit = 6, showClear = true }) => {
  const { isSignedIn, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn && user) {
      fetchRecentlyViewed();
    } else {
      // Load from localStorage for non-logged-in users
      loadFromLocalStorage();
    }
  }, [isSignedIn, user]);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/${user.id}/recently-viewed?limit=${limit}`);
      const data = await res.json();
      
      if (res.ok && data.recentlyViewed) {
        setProducts(data.recentlyViewed);
      }
    } catch (err) {
      console.error('Error fetching recently viewed:', err);
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out incomplete entries that don't have required data
        const validProducts = parsed.filter(p => p.id && p.name && p.price !== undefined);
        setProducts(validProducts.slice(0, limit));
        
        // Clean up localStorage if there were invalid entries
        if (validProducts.length !== parsed.length) {
          localStorage.setItem('recentlyViewed', JSON.stringify(validProducts));
        }
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
    setLoading(false);
  };

  const handleClear = async () => {
    if (isSignedIn && user) {
      try {
        await fetch(`${API_URL}/users/${user.id}/recently-viewed`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.error('Error clearing recently viewed:', err);
      }
    }
    
    localStorage.removeItem('recentlyViewed');
    setProducts([]);
  };

  if (loading) {
    return (
      <Wrapper>
        <Header>
          <TitleRow>
            <FiClock />
            <Title>Recently Viewed</Title>
          </TitleRow>
        </Header>
        <ScrollContainer>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i}>
              <SkeletonImage />
              <SkeletonText />
              <SkeletonText width="60%" />
            </SkeletonCard>
          ))}
        </ScrollContainer>
      </Wrapper>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Wrapper>
      <Header>
        <TitleRow>
          <FiClock />
          <Title>Recently Viewed</Title>
        </TitleRow>
        {showClear && (
          <ClearButton onClick={handleClear}>
            <FiX />
            Clear History
          </ClearButton>
        )}
      </Header>

      <ScrollContainer>
        {products.map((product) => {
          // Skip products without essential data
          if (!product.id || !product.name) return null;
          
          const imageUrl = Array.isArray(product.image) 
            ? (product.image[0] || '/images/placeholder.jpg')
            : (product.image || '/images/placeholder.jpg');
          
          return (
            <ProductCard key={product.id} to={`/singleproduct/${product.id}`}>
              <ImageContainer>
                <ProductImage 
                  src={imageUrl} 
                  alt={product.name || 'Product'}
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <QuickAdd title="Add to Cart">
                  <FiShoppingCart />
                </QuickAdd>
              </ImageContainer>
              <ProductInfo>
                <ProductName>{product.name || 'Unknown Product'}</ProductName>
                <ProductPrice>
                  <FormatPrice price={product.price || 0} />
                </ProductPrice>
              </ProductInfo>
            </ProductCard>
          );
        })}
      </ScrollContainer>
    </Wrapper>
  );
};

// Helper function to record product view (call this from SingleProduct page)
export const recordProductView = async (productData, userId) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Extract product info - handle both object and id-only cases
  const productId = typeof productData === 'object' ? productData.id : productData;
  const productInfo = typeof productData === 'object' ? {
    id: productData.id,
    name: productData.name || 'Unknown Product',
    price: productData.price || 0,
    image: productData.image || [],
    category: productData.category || '',
    viewedAt: new Date().toISOString()
  } : {
    id: productData,
    viewedAt: new Date().toISOString()
  };
  
  // Record to API
  try {
    await fetch(`${API_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch (err) {
    console.error('Error recording product view:', err);
  }

  // Also store locally for non-logged-in users or as backup
  try {
    const stored = localStorage.getItem('recentlyViewed');
    let recentlyViewed = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(p => p.id !== productId);
    
    // Add to beginning with full product info
    recentlyViewed.unshift(productInfo);

    // Keep only last 20
    recentlyViewed = recentlyViewed.slice(0, 20);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  } catch (err) {
    console.error('Error storing in localStorage:', err);
  }
};

const Wrapper = styled.section`
  padding: 32px 0;
  background: #fdfcfb;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8b5a2b;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Title = styled.h3`
  font-size: 1.35rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #ef4444;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #8b5a2b #f0f0f0;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b5a2b;
    border-radius: 3px;
  }
`;

const ProductCard = styled(NavLink)`
  flex-shrink: 0;
  width: 180px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(139, 90, 43, 0.12);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  background: #f8f6f3;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`;

const QuickAdd = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #8b5a2b;

  ${ProductCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover {
    background: #8b5a2b;
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductName = styled.span`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProductPrice = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #8b5a2b;
`;

// Skeleton styles
const SkeletonCard = styled.div`
  flex-shrink: 0;
  width: 180px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  padding: 12px;
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 12px;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const SkeletonText = styled.div`
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: ${props => props.width || '100%'};
`;

export default RecentlyViewed;
