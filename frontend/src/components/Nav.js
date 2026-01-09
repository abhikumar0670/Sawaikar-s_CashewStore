import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { 
  FiShoppingCart, 
  FiHeart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiPackage, 
  FiLogOut, 
  FiEdit2,
  FiCreditCard,
  FiHelpCircle,
  FiChevronDown,
  FiStar
} from "react-icons/fi";
import { useCartContext } from "../context/cart_context";
import { useWishlistContext } from "../context/wishlist_context";

// Admin email list
const ADMIN_EMAILS = ['abhikumar0670@gmail.com'];

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { total_item } = useCartContext();
  const { wishlist } = useWishlistContext();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Check if current user is admin
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
  const userName = user?.fullName || user?.firstName || "User";

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setProfileOpen(false);
  };

  return (
    <NavWrapper>
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li>
          <NavLink to="/" onClick={closeMenu}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </li>
      </ul>

      {/* Action Icons */}
      <div className="nav-icons">
        {isSignedIn ? (
          <>
            {/* Admin Button */}
            {isAdmin && (
              <NavLink to="/admin" className="admin-btn">
                <FiStar size={16} />
                <span>Admin</span>
              </NavLink>
            )}

            {/* Cart Icon */}
            <NavLink to="/cart" className="icon-link cart-icon" title="Cart">
              <FiShoppingCart size={20} />
              {total_item > 0 && (
                <span className="badge">{total_item}</span>
              )}
            </NavLink>

            {/* Profile Dropdown */}
            <div className="profile-section" ref={profileRef}>
              <button className="profile-trigger" onClick={toggleProfile}>
                <div className="user-info">
                  <span className="hello-text">Hello,</span>
                  <span className="user-name">{userName}</span>
                </div>
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    <FiUser size={18} />
                  </div>
                )}
                <FiChevronDown 
                  size={14} 
                  className={`chevron ${profileOpen ? 'open' : ''}`} 
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="profile-dropdown">
                  {/* User Header */}
                  <div className="dropdown-header">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="dropdown-avatar"
                      />
                    ) : (
                      <div className="dropdown-avatar-placeholder">
                        <FiUser size={32} />
                      </div>
                    )}
                    <div className="dropdown-user-info">
                      <h4>{userName}</h4>
                      <p>{userEmail}</p>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <button 
                    className="edit-profile-btn"
                    onClick={() => handleNavigation('/profile')}
                  >
                    <FiEdit2 size={16} />
                    Edit Profile
                  </button>

                  {/* Menu Items */}
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavigation('/orders')}
                    >
                      <div className="item-icon">
                        <FiPackage size={18} />
                      </div>
                      <div className="item-content">
                        <span className="item-title">Orders</span>
                        <span className="item-subtitle">Track, return, cancel</span>
                      </div>
                    </button>

                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavigation('/wishlist')}
                    >
                      <div className="item-icon">
                        <FiHeart size={18} />
                      </div>
                      <div className="item-content">
                        <span className="item-title">Wishlist</span>
                        <span className="item-subtitle">Your saved items</span>
                      </div>
                    </button>

                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavigation('/payment-history')}
                    >
                      <div className="item-icon">
                        <FiCreditCard size={18} />
                      </div>
                      <div className="item-content">
                        <span className="item-title">Payment History</span>
                        <span className="item-subtitle">All your transactions</span>
                      </div>
                    </button>

                    <button 
                      className="dropdown-item"
                      onClick={() => handleNavigation('/faq')}
                    >
                      <div className="item-icon">
                        <FiHelpCircle size={18} />
                      </div>
                      <div className="item-content">
                        <span className="item-title">Help Center</span>
                        <span className="item-subtitle">FAQs & Support</span>
                      </div>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="dropdown-footer">
                    <SignOutButton>
                      <button className="logout-btn">
                        <FiLogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <NavLink to="/login" className="login-btn">
            Login
          </NavLink>
        )}
      </div>
    </NavWrapper>
  );
};

const NavWrapper = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;

  .mobile-menu-btn {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.heading};
    padding: 0.5rem;
    
    &:hover {
      color: ${({ theme }) => theme.colors.helper};
    }
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      a {
        display: block;
        padding: 0.8rem 1.4rem;
        font-size: 1.5rem;
        font-weight: 500;
        color: ${({ theme }) => theme.colors.heading};
        text-decoration: none;
        border-radius: 0.5rem;
        transition: all 0.3s ease;

        &:hover,
        &.active {
          color: ${({ theme }) => theme.colors.helper};
        }
      }
    }
  }

  .nav-icons {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    .admin-btn {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.8rem 1.6rem;
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: white;
      font-size: 1.4rem;
      font-weight: 600;
      border-radius: 0.8rem;
      text-decoration: none;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);

      &:hover {
        background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }

      svg {
        color: #FCD34D;
      }
    }

    .icon-link {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4.2rem;
      height: 4.2rem;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.white};
      color: ${({ theme }) => theme.colors.heading};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 1px solid #eee;

      &:hover {
        background-color: ${({ theme }) => theme.colors.helper};
        color: ${({ theme }) => theme.colors.white};
        transform: translateY(-2px);
        border-color: ${({ theme }) => theme.colors.helper};
      }

      .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
        font-size: 1rem;
        font-weight: 600;
        padding: 0.2rem 0.6rem;
        border-radius: 50%;
        min-width: 1.8rem;
        text-align: center;
      }
    }

    .profile-section {
      position: relative;

      .profile-trigger {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.6rem 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          
          .hello-text {
            font-size: 1.1rem;
            color: #6b7280;
            line-height: 1.2;
          }
          
          .user-name {
            font-size: 1.4rem;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.3;
          }
        }

        .user-avatar {
          width: 3.6rem;
          height: 3.6rem;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e5e7eb;
        }

        .user-avatar-placeholder {
          width: 3.6rem;
          height: 3.6rem;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        .chevron {
          color: #6b7280;
          transition: transform 0.3s ease;
          
          &.open {
            transform: rotate(180deg);
          }
        }
      }

      .profile-dropdown {
        position: absolute;
        top: calc(100% + 1rem);
        right: 0;
        width: 30rem;
        background: white;
        border-radius: 1.2rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        overflow: hidden;
        animation: slideDown 0.2s ease;

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding: 2rem;
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;

          .dropdown-avatar {
            width: 5.5rem;
            height: 5.5rem;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .dropdown-avatar-placeholder {
            width: 5.5rem;
            height: 5.5rem;
            border-radius: 50%;
            background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .dropdown-user-info {
            flex: 1;
            
            h4 {
              font-size: 1.6rem;
              font-weight: 600;
              color: #1f2937;
              margin: 0 0 0.3rem 0;
            }
            
            p {
              font-size: 1.3rem;
              color: #6b7280;
              margin: 0;
            }
          }
        }

        .edit-profile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.8rem;
          width: calc(100% - 4rem);
          margin: 1.5rem 2rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
          color: white;
          font-size: 1.4rem;
          font-weight: 600;
          border: none;
          border-radius: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
          }
        }

        .dropdown-menu {
          padding: 0.5rem 0;

          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 1.2rem;
            width: 100%;
            padding: 1.2rem 2rem;
            background: transparent;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;

            &:hover {
              background: #f9fafb;
            }

            .item-icon {
              width: 4rem;
              height: 4rem;
              border-radius: 50%;
              background: #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6b7280;
              transition: all 0.2s ease;
            }

            &:hover .item-icon {
              background: #D97706;
              color: white;
            }

            .item-content {
              display: flex;
              flex-direction: column;
              
              .item-title {
                font-size: 1.4rem;
                font-weight: 500;
                color: #1f2937;
                line-height: 1.4;
              }
              
              .item-subtitle {
                font-size: 1.2rem;
                color: #9ca3af;
                line-height: 1.4;
              }
            }
          }
        }

        .dropdown-footer {
          padding: 1rem 2rem 1.5rem;
          border-top: 1px solid #f0f0f0;

          .logout-btn {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            width: 100%;
            padding: 1rem 1.5rem;
            background: transparent;
            border: none;
            cursor: pointer;
            font-size: 1.4rem;
            font-weight: 500;
            color: #EF4444;
            border-radius: 0.8rem;
            transition: all 0.2s ease;

            &:hover {
              background: #FEE2E2;
            }
          }
        }
      }
    }

    .login-btn {
      padding: 0.8rem 2rem;
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
      color: white;
      font-size: 1.4rem;
      font-weight: 600;
      border-radius: 0.8rem;
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #B45309 0%, #92400E 100%);
        transform: translateY(-2px);
      }
    }
  }

  /* Tablet Styles */
  @media (max-width: ${({ theme }) => theme.media.tab}) {
    gap: 1rem;
    
    .nav-links {
      gap: 0.3rem;
      
      li a {
        padding: 0.6rem 1rem;
        font-size: 1.3rem;
      }
    }
    
    .nav-icons {
      gap: 1rem;
      
      .admin-btn {
        padding: 0.6rem 1.2rem;
        font-size: 1.3rem;
      }

      .icon-link {
        width: 3.8rem;
        height: 3.8rem;
      }

      .profile-section .profile-trigger {
        padding: 0.5rem 0.8rem;
        
        .user-info {
          display: none;
        }
      }
    }
  }

  /* Mobile Styles */
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    width: 100%;
    flex-direction: column;
    gap: 1rem;

    .mobile-menu-btn {
      display: block;
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .nav-links {
      display: none;
      flex-direction: column;
      width: 100%;
      background-color: ${({ theme }) => theme.colors.white};
      border-radius: 1rem;
      padding: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      &.active {
        display: flex;
      }

      li {
        width: 100%;
        
        a {
          width: 100%;
          text-align: center;
          padding: 1rem;
        }
      }
    }

    .nav-icons {
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;

      .admin-btn {
        padding: 0.6rem 1.2rem;
        font-size: 1.2rem;
      }

      .profile-section {
        .profile-trigger {
          .user-info {
            display: none;
          }
        }

        .profile-dropdown {
          position: fixed;
          top: auto;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          border-radius: 1.5rem 1.5rem 0 0;
          max-height: 80vh;
          overflow-y: auto;
        }
      }
    }
  }
`;

export default Nav;
