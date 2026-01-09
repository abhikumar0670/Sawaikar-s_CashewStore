import styled from "styled-components";
import FilterSection from "./components/FilterSection";
import ProductList from "./components/ProductList";
import Sort from "./components/Sort";
import { NavLink } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Products = () => {
  return (
    <Wrapper>
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav className="breadcrumb">
            <NavLink to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</NavLink>
            <FiChevronRight className="separator" />
            <span className="current">Products</span>
          </nav>
          <h1 className="page-title">Our Premium Collection</h1>
          <p className="page-subtitle">Discover the finest Goan cashews, handpicked for quality and taste</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="products-container">
        <div className="container">
          <div className="products-layout">
            {/* Sidebar Filter */}
            <aside className="filter-sidebar">
              <FilterSection />
            </aside>

            {/* Products Grid */}
            <main className="products-main">
              <div className="sort-bar">
                <Sort />
              </div>
              <div className="products-grid">
                <ProductList />
              </div>
            </main>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  background: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
  overflow-x: hidden;
  width: 100%;

  /* Breadcrumb Section */
  .breadcrumb-section {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.bg} 0%, #fff 100%);
    padding: 3rem 0 4rem;
    border-bottom: 1px solid rgba(139, 69, 19, 0.1);

    .container {
      max-width: 130rem;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1.5rem;
      font-size: 1.4rem;

      a {
        color: ${({ theme }) => theme.colors.text};
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: ${({ theme }) => theme.colors.helper};
        }
      }

      .separator {
        color: ${({ theme }) => theme.colors.text};
        opacity: 0.5;
      }

      .current {
        color: ${({ theme }) => theme.colors.helper};
        font-weight: 600;
      }
    }

    .page-title {
      font-size: 3.2rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.8rem;
      font-family: 'Playfair Display', serif;
    }

    .page-subtitle {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
      opacity: 0.8;
    }
  }

  /* Products Container */
  .products-container {
    padding: 3rem 0 5rem;
    width: 100%;
    overflow-x: hidden;

    .container {
      max-width: 130rem;
      margin: 0 auto;
      padding: 0 2rem;
      box-sizing: border-box;
    }
  }

  /* Products Layout - 2 Column */
  .products-layout {
    display: grid;
    grid-template-columns: 26rem 1fr;
    gap: 3rem;
    align-items: start;
  }

  /* Filter Sidebar */
  .filter-sidebar {
    position: sticky;
    top: 2rem;
    background: #fff;
    border-radius: 1.2rem;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(139, 69, 19, 0.08);
    border: 1px solid rgba(139, 69, 19, 0.1);
    max-height: calc(100vh - 4rem);
    overflow-y: auto;

    /* Custom scrollbar */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colors.bg};
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colors.btn};
      border-radius: 3px;
    }
  }

  /* Products Main Area */
  .products-main {
    overflow: hidden;
    min-width: 0;

    .sort-bar {
      background: #fff;
      border-radius: 1rem;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(139, 69, 19, 0.06);
      border: 1px solid rgba(139, 69, 19, 0.08);
    }

    .products-grid {
      background: transparent;
      border-radius: 1.2rem;
      padding: 0;
      min-height: 50rem;
      overflow: hidden;
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .products-layout {
      grid-template-columns: 24rem 1fr;
      gap: 2rem;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .breadcrumb-section {
      padding: 2rem 0 3rem;

      .page-title {
        font-size: 2.6rem;
      }
    }

    .products-layout {
      grid-template-columns: 1fr;
    }

    .filter-sidebar {
      position: relative;
      top: 0;
      max-height: none;
      margin-bottom: 2rem;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .breadcrumb-section {
      padding: 1.5rem 0 2rem;

      .page-title {
        font-size: 2.2rem;
      }

      .page-subtitle {
        font-size: 1.4rem;
      }
    }

    .products-container {
      padding: 2rem 0;
    }

    .products-main {
      .sort-bar {
        padding: 1rem 1.5rem;
      }

      .products-grid {
        padding: 0;
      }
    }
  }
`;

export default Products;