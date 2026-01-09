import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import styled from 'styled-components';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCamera, FiCheck, FiX, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageNavigation from './components/PageNavigation';

const Profile = () => {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  if (!isLoaded) {
    return (
      <Wrapper>
        <PageNavigation title="Profile" />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </Wrapper>
    );
  }

  const handleOpenClerkProfile = () => {
    openUserProfile();
  };

  const handleEditClick = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ firstName: '', lastName: '' });
  };

  const handleSaveProfile = async () => {
    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Wrapper>
      <PageNavigation title="Profile" />
      <div className="container">
        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <FiUser size={48} />
                  </div>
                )}
                <button className="change-photo-btn" onClick={handleOpenClerkProfile}>
                  <FiCamera size={16} />
                </button>
              </div>
              <div className="user-info">
                <h1>{user?.fullName || 'User'}</h1>
                <p className="email">{user?.primaryEmailAddress?.emailAddress}</p>
                <span className="member-badge">
                  <FiShield size={14} />
                  Member since {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
            
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEditClick}>
                <FiEdit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveProfile}>
                  <FiCheck size={18} />
                  Save
                </button>
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  <FiX size={18} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <h2>Personal Information</h2>
            
            <div className="details-grid">
              <div className="detail-item">
                <label>
                  <FiUser size={18} />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                ) : (
                  <span>{user?.firstName || 'Not set'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FiUser size={18} />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                ) : (
                  <span>{user?.lastName || 'Not set'}</span>
                )}
              </div>

              <div className="detail-item">
                <label>
                  <FiMail size={18} />
                  Email Address
                </label>
                <span>{user?.primaryEmailAddress?.emailAddress || 'Not set'}</span>
              </div>

              <div className="detail-item">
                <label>
                  <FiPhone size={18} />
                  Phone Number
                </label>
                <span>{user?.primaryPhoneNumber?.phoneNumber || 'Not set'}</span>
              </div>

              <div className="detail-item">
                <label>
                  <FiCalendar size={18} />
                  Account Created
                </label>
                <span>{formatDate(user?.createdAt)}</span>
              </div>

              <div className="detail-item">
                <label>
                  <FiCalendar size={18} />
                  Last Updated
                </label>
                <span>{formatDate(user?.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="account-actions">
            <h2>Account Settings</h2>
            <div className="action-buttons">
              <button className="action-btn primary" onClick={handleOpenClerkProfile}>
                <FiEdit2 size={18} />
                Manage Account
              </button>
              <button className="action-btn secondary" onClick={handleOpenClerkProfile}>
                <FiShield size={18} />
                Security Settings
              </button>
            </div>
            <p className="action-note">
              Click "Manage Account" to change your photo, email, password, and connected accounts.
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .container {
    max-width: 90rem;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  .loading {
    text-align: center;
    padding: 4rem;
    font-size: 1.6rem;
    color: #6b7280;
  }

  .profile-card {
    background: white;
    border-radius: 1.6rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 3rem;
    background: linear-gradient(135deg, #FFF8DC 0%, #FFEFD5 100%);
    border-bottom: 1px solid #f0f0f0;

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .avatar-wrapper {
      position: relative;

      .avatar {
        width: 10rem;
        height: 10rem;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .avatar-placeholder {
        width: 10rem;
        height: 10rem;
        border-radius: 50%;
        background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .change-photo-btn {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 3.2rem;
        height: 3.2rem;
        border-radius: 50%;
        background: #D97706;
        color: white;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: #B45309;
          transform: scale(1.1);
        }
      }
    }

    .user-info {
      h1 {
        font-size: 2.4rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 0.5rem 0;
      }

      .email {
        font-size: 1.4rem;
        color: #6b7280;
        margin: 0 0 1rem 0;
      }

      .member-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(217, 119, 6, 0.1);
        color: #D97706;
        border-radius: 2rem;
        font-size: 1.2rem;
        font-weight: 500;
      }
    }

    .edit-btn {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
      color: white;
      font-size: 1.4rem;
      font-weight: 600;
      border: none;
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
      }
    }

    .edit-actions {
      display: flex;
      gap: 1rem;

      .save-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        background: #10B981;
        color: white;
        font-size: 1.4rem;
        font-weight: 600;
        border: none;
        border-radius: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: #059669;
        }
      }

      .cancel-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 1.5rem;
        background: #EF4444;
        color: white;
        font-size: 1.4rem;
        font-weight: 600;
        border: none;
        border-radius: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: #DC2626;
        }
      }
    }
  }

  .profile-details {
    padding: 3rem;
    border-bottom: 1px solid #f0f0f0;

    h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 2rem 0;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .detail-item {
      label {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 1.3rem;
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 0.8rem;

        svg {
          color: #D97706;
        }
      }

      span {
        display: block;
        font-size: 1.5rem;
        color: #1f2937;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 1rem 1.2rem;
        font-size: 1.5rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.8rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #D97706;
          box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
        }
      }
    }
  }

  .account-actions {
    padding: 3rem;

    h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 2rem 0;
    }

    .action-buttons {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 1.2rem 2rem;
      font-size: 1.4rem;
      font-weight: 600;
      border: none;
      border-radius: 0.8rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &.primary {
        background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }
      }

      &.secondary {
        background: #f3f4f6;
        color: #374151;

        &:hover {
          background: #e5e7eb;
        }
      }
    }

    .action-note {
      font-size: 1.3rem;
      color: #6b7280;
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      gap: 2rem;

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .user-info {
        text-align: center;
      }

      .edit-btn {
        width: 100%;
        justify-content: center;
      }

      .edit-actions {
        width: 100%;
        
        .save-btn, .cancel-btn {
          flex: 1;
          justify-content: center;
        }
      }
    }
  }
`;

export default Profile;
