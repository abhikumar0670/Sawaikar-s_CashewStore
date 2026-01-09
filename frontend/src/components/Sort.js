import React from "react";
import styled from "styled-components";
import { BsFillGridFill, BsList } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import { useFilterContext } from "../context/filter_context";

const Sort = () => {
  const { filter_products, grid_view, setGridView, setListView, sorting } =
    useFilterContext();
  return (
    <Wrapper>
      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`view-btn ${grid_view ? "active" : ""}`}
          onClick={setGridView}
          title="Grid View"
        >
          <BsFillGridFill />
        </button>
        <button
          className={`view-btn ${!grid_view ? "active" : ""}`}
          onClick={setListView}
          title="List View"
        >
          <BsList />
        </button>
      </div>

      {/* Product Count */}
      <div className="product-count">
        <span className="count-number">{filter_products.length}</span>
        <span className="count-text">Products Found</span>
      </div>

      {/* Sort Dropdown */}
      <div className="sort-dropdown">
        <label htmlFor="sort" className="sort-label">Sort by:</label>
        <div className="select-wrapper">
          <select
            name="sort"
            id="sort"
            className="sort-select"
            onClick={sorting}
          >
            <option value="lowest">Price: Low to High</option>
            <option value="highest">Price: High to Low</option>
            <option value="a-z">Name: A to Z</option>
            <option value="z-a">Name: Z to A</option>
          </select>
          <FiChevronDown className="select-icon" />
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;

  /* View Toggle */
  .view-toggle {
    display: flex;
    gap: 0.5rem;
    background: ${({ theme }) => theme.colors.bg};
    padding: 0.4rem;
    border-radius: 0.8rem;

    .view-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      border: none;
      background: transparent;
      border-radius: 0.6rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: ${({ theme }) => theme.colors.text};

      svg {
        font-size: 1.8rem;
      }

      &:hover {
        background: white;
        color: ${({ theme }) => theme.colors.helper};
      }

      &.active {
        background: ${({ theme }) => theme.colors.btn};
        color: white;
        box-shadow: 0 2px 8px rgba(139, 69, 19, 0.25);
      }
    }
  }

  /* Product Count */
  .product-count {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    .count-number {
      font-size: 2rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.helper};
    }

    .count-text {
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  /* Sort Dropdown */
  .sort-dropdown {
    display: flex;
    align-items: center;
    gap: 1rem;

    .sort-label {
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.text};
      font-weight: 500;
    }

    .select-wrapper {
      position: relative;

      .sort-select {
        appearance: none;
        padding: 1rem 4rem 1rem 1.5rem;
        border: 1px solid rgba(139, 69, 19, 0.15);
        border-radius: 0.8rem;
        font-size: 1.4rem;
        color: ${({ theme }) => theme.colors.heading};
        background: ${({ theme }) => theme.colors.bg};
        cursor: pointer;
        min-width: 18rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: ${({ theme }) => theme.colors.helper};
          box-shadow: 0 0 0 3px rgba(210, 105, 30, 0.1);
        }

        &:hover {
          border-color: ${({ theme }) => theme.colors.helper};
        }
      }

      .select-icon {
        position: absolute;
        right: 1.2rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.6rem;
        color: ${({ theme }) => theme.colors.helper};
        pointer-events: none;
      }
    }
  }

  /* Responsive */
  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .product-count {
      order: -1;
      width: 100%;
      justify-content: center;
      margin-bottom: 1rem;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    flex-direction: column;
    gap: 1.5rem;

    .view-toggle {
      order: 1;
    }

    .sort-dropdown {
      order: 2;
      width: 100%;

      .select-wrapper {
        flex: 1;

        .sort-select {
          width: 100%;
        }
      }
    }

    .product-count {
      order: 0;
      margin-bottom: 0;
    }
  }
`;

export default Sort;