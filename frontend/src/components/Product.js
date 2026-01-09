import React from 'react'
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import FormatPrice from '../Helpers/FormatPrice';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCartContext } from '../context/cart_context';
import { notifyAddToCart } from '../utils/customToast';
import LazyImage from './LazyImage';

const Product = (curElem) => {
    const { id, name, image, price, category, stock, variants, defaultWeight } = curElem;
    const { addToCart } = useCartContext();
    
    // Get the first image if it's an array, otherwise use the image directly
    const displayImage = Array.isArray(image) ? image[0] : image;

    // Get display price based on default variant or base price
    const getDisplayPrice = () => {
      if (variants && variants.length > 0) {
        const defaultVariant = variants.find(v => v.weight === defaultWeight) || variants[0];
        return defaultVariant.price;
      }
      return price;
    };

    const displayPrice = getDisplayPrice();

    // Calculate original price for showing discount
    const originalPrice = displayPrice ? Math.ceil(displayPrice * 1.2) : 0;
    const discount = originalPrice && displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

    // Quick add to cart handler
    const handleQuickAdd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const defaultColor = curElem.colors && curElem.colors.length > 0 ? curElem.colors[0] : "default";
      // Include default weight and price in product
      const productWithWeight = {
        ...curElem,
        selectedWeight: defaultWeight || (variants && variants.length > 0 ? variants[0].weight : ''),
        price: displayPrice
      };
      addToCart(id, defaultColor, 1, productWithWeight);
      notifyAddToCart(); // 🟢 Green toast with checkmark
    };

  return (
    <ProductWrapper>
      <NavLink to={`/singleproduct/${id}`} className="card-link">
        <div className="product-card">
          {/* Image Container */}
          <div className="image-container">
            <LazyImage 
              src={displayImage} 
              alt={name} 
              className="product-image"
              aspectRatio="1/1"
            />
            
            {/* Discount Badge */}
            {discount > 0 && (
              <span className="discount-badge">{discount}% OFF</span>
            )}
            
            {/* Stock Badge */}
            {stock === 0 && (
              <span className="out-of-stock-badge">Out of Stock</span>
            )}

            {/* Hover Overlay */}
            <div className="hover-overlay">
              <button 
                className="quick-action view-btn"
                title="View Product"
              >
                <FiEye />
              </button>
              {stock > 0 && (
                <button 
                  className="quick-action cart-btn"
                  onClick={handleQuickAdd}
                  title="Quick Add to Cart"
                >
                  <FiShoppingCart />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <span className="category-tag">{category}</span>
            <h3 className="product-name">{name}</h3>
            
            {/* Weight options preview */}
            {variants && variants.length > 0 && (
              <div className="weight-options-preview">
                {variants.slice(0, 3).map((v, i) => (
                  <span key={i} className="weight-tag">{v.weight}</span>
                ))}
                {variants.length > 3 && <span className="more-weights">+{variants.length - 3}</span>}
              </div>
            )}
            
            <div className="price-row">
              <span className="current-price"><FormatPrice price={displayPrice}/></span>
              {originalPrice > displayPrice && (
                <span className="original-price"><FormatPrice price={originalPrice}/></span>
              )}
              {variants && variants.length > 0 && (
                <span className="per-weight">/ {defaultWeight || variants[0].weight}</span>
              )}
            </div>
          </div>
        </div>
      </NavLink>
    </ProductWrapper>
  )
}

const ProductWrapper = styled.div`
  .card-link {
    text-decoration: none;
    display: block;
  }

  .product-card {
    background: #fff;
    border-radius: 1.2rem;
    overflow: hidden;
    transition: all 0.35s ease;
    border: 1px solid rgba(139, 69, 19, 0.08);
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 28px rgba(139, 69, 19, 0.12);
      border-color: rgba(139, 69, 19, 0.15);

      .hover-overlay {
        opacity: 1;
        visibility: visible;
      }

      .product-image {
        transform: scale(1.05);
      }
    }
  }

  .image-container {
    position: relative;
    height: 22rem;
    overflow: hidden;
    background: linear-gradient(135deg, #FFF8DC 0%, #f5f0e1 100%);

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .discount-badge {
      position: absolute;
      top: 1.2rem;
      left: 1.2rem;
      background: linear-gradient(135deg, #e53935, #c62828);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.03rem;
      box-shadow: 0 2px 8px rgba(229, 57, 53, 0.3);
    }

    .out-of-stock-badge {
      position: absolute;
      top: 1.2rem;
      right: 1.2rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .hover-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.5rem;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      display: flex;
      justify-content: center;
      gap: 1rem;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;

      .quick-action {
        width: 4.2rem;
        height: 4.2rem;
        border-radius: 50%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.6rem;

        &.view-btn {
          background: white;
          color: ${({ theme }) => theme.colors.heading};

          &:hover {
            background: ${({ theme }) => theme.colors.bg};
            color: ${({ theme }) => theme.colors.helper};
          }
        }

        &.cart-btn {
          background: ${({ theme }) => theme.colors.btn};
          color: white;

          &:hover {
            background: ${({ theme }) => theme.colors.helper};
            transform: scale(1.1);
          }
        }
      }
    }
  }

  .product-info {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;

    .category-tag {
      display: inline-block;
      font-size: 1.1rem;
      color: ${({ theme }) => theme.colors.helper};
      text-transform: uppercase;
      letter-spacing: 0.08rem;
      font-weight: 600;
      margin-bottom: 0.6rem;
    }

    .product-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.8rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .weight-options-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.8rem;
      
      .weight-tag {
        background: linear-gradient(135deg, #FFF8DC 0%, #FAEBD7 100%);
        color: ${({ theme }) => theme.colors.helper};
        padding: 0.3rem 0.7rem;
        border-radius: 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        border: 1px solid ${({ theme }) => theme.colors.helper};
      }
      
      .more-weights {
        color: ${({ theme }) => theme.colors.text};
        font-size: 1rem;
        font-weight: 500;
        padding: 0.3rem 0.5rem;
      }
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-top: auto;
      flex-wrap: wrap;

      .current-price {
        font-size: 1.7rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.helper};
      }

      .original-price {
        font-size: 1.3rem;
        color: #999;
        text-decoration: line-through;
      }
      
      .per-weight {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.text};
        font-weight: 500;
      }
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .image-container {
      height: 18rem;
    }

    .product-info {
      padding: 1.2rem;

      .product-name {
        font-size: 1.4rem;
      }

      .price-row .current-price {
        font-size: 1.5rem;
      }
    }
  }
`;

export default Product
