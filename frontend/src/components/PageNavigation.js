import React from 'react'
import { NavLink } from 'react-router-dom';
import styled from 'styled-components'
import { FiChevronRight, FiHome } from 'react-icons/fi';

const PageNavigation = ({title}) => {
  return (
    <Wrapper>
      <div className="breadcrumb-container">
        <nav className="breadcrumb">
          <NavLink to="/" className="breadcrumb-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <FiHome className="home-icon" />
            <span>Home</span>
          </NavLink>
          <FiChevronRight className="separator" />
          <NavLink to="/products" className="breadcrumb-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Products
          </NavLink>
          <FiChevronRight className="separator" />
          <span className="current">{title}</span>
        </nav>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.section`
  background: linear-gradient(135deg, ${({theme}) => theme.colors.bg} 0%, #fff 100%);
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  
  .breadcrumb-container {
    max-width: 140rem;
    margin: 0 auto;
    padding: 2rem;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.4rem;
    color: ${({theme}) => theme.colors.text};
    text-decoration: none;
    transition: all 0.3s ease;
    padding: 0.4rem 0;

    .home-icon {
      font-size: 1.6rem;
    }

    &:hover {
      color: ${({theme}) => theme.colors.helper};
    }
  }

  .separator {
    color: ${({theme}) => theme.colors.text};
    opacity: 0.4;
    font-size: 1.4rem;
  }

  .current {
    font-size: 1.4rem;
    color: ${({theme}) => theme.colors.helper};
    font-weight: 600;
    max-width: 30rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: ${({theme}) => theme.media.mobile}) {
    .breadcrumb-container {
      padding: 1.5rem;
    }

    .breadcrumb-link,
    .current {
      font-size: 1.3rem;
    }

    .current {
      max-width: 15rem;
    }
  }
`;

export default PageNavigation
