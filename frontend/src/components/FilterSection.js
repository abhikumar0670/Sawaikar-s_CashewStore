import styled from "styled-components";
import { useFilterContext } from "../context/filter_context";
import FormatPrice from "../Helpers/FormatPrice";
import { FiSearch, FiX, FiStar, FiCheck, FiPackage, FiTruck, FiAward } from "react-icons/fi";

const FilterSection = () => {
  const {
    filters: { text, category, price, maxPrice, minPrice, rating, inStock, featured, freeShipping },
    updateFilterValue,
    all_products,
    clearFilters,
  } = useFilterContext();

  // get the unique values of each property
  const getUniqueData = (data, attr) => {
    let newVal = data.map((curElem) => {
      return curElem[attr];
    });

    return (newVal = ["all", ...new Set(newVal)]);
  };

  // we need to have the individual data of each in an array format
  const categoryData = getUniqueData(all_products, "category");
  const companyData = getUniqueData(all_products, "company");

  return (
    <Wrapper>
      {/* Filter Header */}
      <div className="filter-header">
        <h2>Filters</h2>
        <button className="clear-all-btn" onClick={clearFilters}>
          <FiX /> Clear All
        </button>
      </div>

      {/* Search */}
      <div className="filter-block">
        <h3 className="filter-title">Search</h3>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="text"
              placeholder="Search products..."
              value={text}
              onChange={updateFilterValue}
            />
          </form>
        </div>
      </div>

      {/* Category */}
      <div className="filter-block">
        <h3 className="filter-title">Category</h3>
        <div className="select-wrapper">
          <select
            name="category"
            id="category"
            className="category-select"
            value={category}
            onChange={updateFilterValue}>
            {categoryData.map((curElem, index) => {
              return (
                <option key={index} value={curElem} name="category">
                  {curElem}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Company/Brand */}
      <div className="filter-block">
        <h3 className="filter-title">Brand</h3>
        <div className="select-wrapper">
          <select
            name="company"
            id="company"
            className="brand-select"
            onClick={updateFilterValue}>
            {companyData.map((curElem, index) => {
              return (
                <option key={index} value={curElem} name="company">
                  {curElem}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-block">
        <h3 className="filter-title">Price Range</h3>
        <div className="price-filter">
          <div className="price-display">
            <span className="price-label">Up to</span>
            <span className="price-value"><FormatPrice price={price} /></span>
          </div>
          <input
            type="range"
            name="price"
            min={minPrice}
            max={maxPrice}
            value={price}
            onChange={updateFilterValue}
            className="price-slider"
          />
          <div className="price-range-labels">
            <span><FormatPrice price={minPrice} /></span>
            <span><FormatPrice price={maxPrice} /></span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="filter-block">
        <h3 className="filter-title">Rating</h3>
        <div className="rating-filter">
          {[4, 3, 2, 1].map((star) => (
            <label key={star} className={`rating-option ${rating >= star ? 'active' : ''}`}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={updateFilterValue}
              />
              <span className="rating-stars">
                {[...Array(5)].map((_, idx) => (
                  <FiStar 
                    key={idx} 
                    className={idx < star ? 'filled' : ''} 
                  />
                ))}
              </span>
              <span className="rating-text">& Up</span>
            </label>
          ))}
          {rating > 0 && (
            <button 
              className="rating-clear"
              onClick={() => updateFilterValue({ target: { name: 'rating', value: 0 } })}
            >
              Clear Rating Filter
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="filter-block">
        <h3 className="filter-title">Quick Filters</h3>
        <div className="quick-filters">
          <label className={`quick-filter-option ${inStock ? 'active' : ''}`}>
            <input
              type="checkbox"
              name="inStock"
              checked={inStock}
              onChange={(e) => updateFilterValue({ target: { name: 'inStock', value: e.target.checked } })}
            />
            <span className="filter-checkbox">
              {inStock && <FiCheck />}
            </span>
            <FiPackage className="filter-icon" />
            <span>In Stock Only</span>
          </label>
          
          <label className={`quick-filter-option ${featured ? 'active' : ''}`}>
            <input
              type="checkbox"
              name="featured"
              checked={featured}
              onChange={(e) => updateFilterValue({ target: { name: 'featured', value: e.target.checked } })}
            />
            <span className="filter-checkbox">
              {featured && <FiCheck />}
            </span>
            <FiAward className="filter-icon" />
            <span>Featured Products</span>
          </label>
          
          <label className={`quick-filter-option ${freeShipping ? 'active' : ''}`}>
            <input
              type="checkbox"
              name="freeShipping"
              checked={freeShipping}
              onChange={(e) => updateFilterValue({ target: { name: 'freeShipping', value: e.target.checked } })}
            />
            <span className="filter-checkbox">
              {freeShipping && <FiCheck />}
            </span>
            <FiTruck className="filter-icon" />
            <span>Free Shipping</span>
          </label>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0;

  /* Filter Header */
  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(139, 69, 19, 0.1);
    margin-bottom: 2rem;

    h2 {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      font-family: 'Playfair Display', serif;
    }

    .clear-all-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.helper};
      font-size: 1.3rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.5rem 0;
      transition: all 0.3s ease;

      svg {
        font-size: 1.4rem;
      }

      &:hover {
        color: #e53935;
      }
    }
  }

  /* Filter Block */
  .filter-block {
    padding: 1.5rem 0;
    border-bottom: 1px solid rgba(139, 69, 19, 0.08);

    &:last-child {
      border-bottom: none;
    }

    .filter-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 0.05rem;
    }
  }

  /* Search Box */
  .search-box {
    position: relative;

    .search-icon {
      position: absolute;
      left: 1.2rem;
      top: 50%;
      transform: translateY(-50%);
      color: ${({ theme }) => theme.colors.text};
      opacity: 0.5;
      font-size: 1.6rem;
    }

    input {
      width: 100%;
      padding: 1.2rem 1.2rem 1.2rem 4rem;
      border: 1px solid rgba(139, 69, 19, 0.15);
      border-radius: 0.8rem;
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.text};
      background: ${({ theme }) => theme.colors.bg};
      transition: all 0.3s ease;

      &::placeholder {
        color: ${({ theme }) => theme.colors.text};
        opacity: 0.5;
      }

      &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.helper};
        box-shadow: 0 0 0 3px rgba(210, 105, 30, 0.1);
      }
    }
  }

  /* Category Select */
  .category-select {
    width: 100%;
    padding: 1.2rem 1.4rem;
    border: 1px solid rgba(139, 69, 19, 0.15);
    border-radius: 0.8rem;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
    cursor: pointer;
    text-transform: capitalize;
    appearance: none;
    transition: all 0.3s ease;
    max-height: 20rem;
    overflow-y: auto;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.helper};
      box-shadow: 0 0 0 3px rgba(210, 105, 30, 0.1);
    }

    option {
      padding: 1rem;
      text-transform: capitalize;
      background: ${({ theme }) => theme.colors.bg};
      color: ${({ theme }) => theme.colors.text};
      
      &:hover {
        background: ${({ theme }) => theme.colors.helper};
        color: white;
      }

      &:checked {
        background: linear-gradient(135deg, ${({ theme }) => theme.colors.btn}, ${({ theme }) => theme.colors.helper});
        color: white;
        font-weight: 600;
      }
    }
  }

  /* Brand Select */
  .select-wrapper {
    position: relative;

    .brand-select {
      width: 100%;
      padding: 1.2rem 1.4rem;
      border: 1px solid rgba(139, 69, 19, 0.15);
      border-radius: 0.8rem;
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.text};
      background: ${({ theme }) => theme.colors.bg};
      cursor: pointer;
      text-transform: capitalize;
      appearance: none;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.helper};
      }
    }

    &::after {
      content: '▼';
      position: absolute;
      right: 1.4rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      color: ${({ theme }) => theme.colors.text};
      opacity: 0.5;
      pointer-events: none;
    }
  }

  /* Price Filter */
  .price-filter {
    .price-display {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding: 1rem 1.4rem;
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 0.8rem;

      .price-label {
        font-size: 1.3rem;
        color: ${({ theme }) => theme.colors.text};
      }

      .price-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: ${({ theme }) => theme.colors.helper};
      }
    }

    .price-slider {
      width: 100%;
      height: 0.6rem;
      -webkit-appearance: none;
      appearance: none;
      background: linear-gradient(to right, 
        ${({ theme }) => theme.colors.helper} 0%, 
        ${({ theme }) => theme.colors.helper} 50%, 
        #e0e0e0 50%, 
        #e0e0e0 100%
      );
      border-radius: 0.3rem;
      cursor: pointer;
      margin-bottom: 1rem;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 2rem;
        height: 2rem;
        background: ${({ theme }) => theme.colors.btn};
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.1);
        }
      }

      &::-moz-range-thumb {
        width: 2rem;
        height: 2rem;
        background: ${({ theme }) => theme.colors.btn};
        border-radius: 50%;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }
    }

    .price-range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 1.2rem;
      color: ${({ theme }) => theme.colors.text};
      opacity: 0.7;
    }
  }

  /* Rating Filter Styles */
  .rating-filter {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    .rating-option {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.8rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f9fafb;
      border: 2px solid transparent;

      input[type="radio"] {
        display: none;
      }

      &:hover {
        background: #f3f0eb;
        border-color: rgba(139, 69, 19, 0.2);
      }

      &.active {
        background: rgba(139, 69, 19, 0.1);
        border-color: ${({ theme }) => theme.colors.helper};
      }

      .rating-stars {
        display: flex;
        gap: 0.2rem;

        svg {
          font-size: 1.4rem;
          color: #e0e0e0;
          transition: color 0.2s ease;

          &.filled {
            color: #fbbf24;
            fill: #fbbf24;
          }
        }
      }

      .rating-text {
        font-size: 1.3rem;
        color: ${({ theme }) => theme.colors.text};
      }
    }

    .rating-clear {
      background: none;
      border: none;
      color: ${({ theme }) => theme.colors.helper};
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      text-decoration: underline;
      margin-top: 0.5rem;

      &:hover {
        color: ${({ theme }) => theme.colors.btn};
      }
    }
  }

  /* Quick Filters Styles */
  .quick-filters {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    .quick-filter-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.2rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f9fafb;
      border: 2px solid transparent;

      input[type="checkbox"] {
        display: none;
      }

      .filter-checkbox {
        width: 2rem;
        height: 2rem;
        border-radius: 6px;
        border: 2px solid #d1d5db;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background: white;

        svg {
          font-size: 1.2rem;
          color: white;
        }
      }

      .filter-icon {
        font-size: 1.6rem;
        color: ${({ theme }) => theme.colors.helper};
      }

      span:last-child {
        font-size: 1.4rem;
        font-weight: 500;
        color: ${({ theme }) => theme.colors.text};
      }

      &:hover {
        background: #f3f0eb;
        border-color: rgba(139, 69, 19, 0.2);
      }

      &.active {
        background: rgba(139, 69, 19, 0.1);
        border-color: ${({ theme }) => theme.colors.helper};

        .filter-checkbox {
          background: ${({ theme }) => theme.colors.helper};
          border-color: ${({ theme }) => theme.colors.helper};
        }
      }
    }
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .filter-header {
      h2 {
        font-size: 1.6rem;
      }
    }
  }
`;

export default FilterSection;