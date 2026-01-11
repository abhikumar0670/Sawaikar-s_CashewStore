import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import styled from 'styled-components';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiCamera, FiCheck, FiX, FiShield, FiMapPin, FiHome, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageNavigation from './components/PageNavigation';
import { API_ENDPOINTS } from './config/api';

const Profile = () => {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [dbUser, setDbUser] = useState(null);

  // Fetch user data from MongoDB
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`${API_ENDPOINTS.USERS}/${user.id}`);
          const data = await response.json();
          if (data.success) {
            setDbUser(data.user);
            setAddresses(data.user.addresses || []);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user?.id]);

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
      phone: dbUser?.phone || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ firstName: '', lastName: '', phone: '' });
  };

  const handleSaveProfile = async () => {
    try {
      let clerkUpdateSuccess = true;
      
      // Try to update Clerk user (name only) - but don't fail if it doesn't work
      try {
        await user.update({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      } catch (clerkError) {
        console.log('Clerk update skipped or failed:', clerkError);
        clerkUpdateSuccess = false;
      }

      // Update phone in MongoDB
      const response = await fetch(`${API_ENDPOINTS.USERS}/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setDbUser(data.user);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }

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

  // Address handlers
  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAddAddress = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || 
        !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${user.id}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        setShowAddressForm(false);
        resetAddressForm();
        toast.success('Address added successfully!');
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const handleUpdateAddress = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || 
        !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${user.id}/addresses/${editingAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        setEditingAddress(null);
        setShowAddressForm(false);
        resetAddressForm();
        toast.success('Address updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}/${user.id}/addresses/${addressId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        toast.success('Address deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      label: address.label || 'Home',
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingAddress(address._id);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Home',
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
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
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <span>{dbUser?.phone || (addresses.length > 0 ? addresses.find(a => a.isDefault)?.phone || addresses[0]?.phone : 'Not set') || 'Not set'}</span>
                )}
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

          {/* Address Section */}
          <div className="address-section">
            <div className="section-header">
              <h2><FiMapPin size={20} /> Delivery Addresses</h2>
              <button 
                className="add-address-btn" 
                onClick={() => {
                  resetAddressForm();
                  setEditingAddress(null);
                  setShowAddressForm(true);
                }}
              >
                <FiPlus size={18} />
                Add Address
              </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="address-form">
                <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Label</label>
                    <select name="label" value={addressForm.label} onChange={handleAddressInputChange}>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={addressForm.name}
                      onChange={handleAddressInputChange}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Address *</label>
                    <textarea
                      name="address"
                      value={addressForm.address}
                      onChange={handleAddressInputChange}
                      placeholder="House no, Building, Street, Area"
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressInputChange}
                      placeholder="Enter state"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressInputChange}
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressInputChange}
                      />
                      Set as default address
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    className="save-address-btn" 
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                  >
                    <FiCheck size={18} />
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button 
                    className="cancel-address-btn" 
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      resetAddressForm();
                    }}
                  >
                    <FiX size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            <div className="address-list">
              {addresses.length === 0 ? (
                <div className="no-addresses">
                  <FiHome size={48} />
                  <p>No addresses saved yet</p>
                  <span>Add an address for faster checkout</span>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="address-header">
                      <span className="address-label">{addr.label}</span>
                      {addr.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <div className="address-content">
                      <p className="name">{addr.name}</p>
                      <p className="phone"><FiPhone size={14} /> {addr.phone}</p>
                      <p className="full-address">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <div className="address-actions">
                      <button className="edit-address-btn" onClick={() => handleEditAddress(addr)}>
                        <FiEdit2 size={16} /> Edit
                      </button>
                      <button className="delete-address-btn" onClick={() => handleDeleteAddress(addr._id)}>
                        <FiTrash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
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

  /* Address Section Styles */
  .address-section {
    padding: 3rem;
    border-bottom: 1px solid #f0f0f0;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h2 {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 1.8rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;

        svg {
          color: #D97706;
        }
      }

      .add-address-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.5rem;
        background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
        color: white;
        font-size: 1.3rem;
        font-weight: 600;
        border: none;
        border-radius: 0.6rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }
      }
    }

    .address-form {
      background: #f9fafb;
      padding: 2rem;
      border-radius: 1rem;
      margin-bottom: 2rem;

      h3 {
        font-size: 1.6rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 1.5rem 0;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }

        .form-group {
          &.full-width {
            grid-column: 1 / -1;
          }

          &.checkbox-group {
            grid-column: 1 / -1;
          }

          label {
            display: block;
            font-size: 1.3rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.5rem;
          }

          input, select, textarea {
            width: 100%;
            padding: 1rem;
            font-size: 1.4rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.6rem;
            transition: all 0.3s ease;

            &:focus {
              outline: none;
              border-color: #D97706;
              box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.1);
            }
          }

          textarea {
            resize: vertical;
            min-height: 6rem;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            cursor: pointer;
            font-size: 1.4rem;

            input[type="checkbox"] {
              width: 1.8rem;
              height: 1.8rem;
              accent-color: #D97706;
            }
          }
        }
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;

        .save-address-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: #10B981;
          color: white;
          font-size: 1.4rem;
          font-weight: 600;
          border: none;
          border-radius: 0.6rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: #059669;
          }
        }

        .cancel-address-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: #f3f4f6;
          color: #374151;
          font-size: 1.4rem;
          font-weight: 600;
          border: none;
          border-radius: 0.6rem;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: #e5e7eb;
          }
        }
      }
    }

    .address-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
      gap: 1.5rem;

      .no-addresses {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        color: #9ca3af;

        svg {
          margin-bottom: 1rem;
        }

        p {
          font-size: 1.6rem;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
        }

        span {
          font-size: 1.3rem;
        }
      }

      .address-card {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 1rem;
        padding: 1.5rem;
        transition: all 0.3s ease;

        &:hover {
          border-color: #D97706;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        &.default {
          border-color: #D97706;
          background: linear-gradient(135deg, #FFF8DC 0%, #FFEFD5 100%);
        }

        .address-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1rem;

          .address-label {
            font-size: 1.3rem;
            font-weight: 600;
            color: #D97706;
            background: rgba(217, 119, 6, 0.1);
            padding: 0.3rem 0.8rem;
            border-radius: 0.4rem;
          }

          .default-badge {
            font-size: 1.1rem;
            font-weight: 500;
            color: #059669;
            background: rgba(5, 150, 105, 0.1);
            padding: 0.3rem 0.8rem;
            border-radius: 0.4rem;
          }
        }

        .address-content {
          .name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 0.5rem 0;
          }

          .phone {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.3rem;
            color: #6b7280;
            margin: 0 0 0.8rem 0;
          }

          .full-address {
            font-size: 1.3rem;
            color: #374151;
            line-height: 1.5;
            margin: 0;
          }
        }

        .address-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;

          .edit-address-btn, .delete-address-btn {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.6rem 1rem;
            font-size: 1.2rem;
            font-weight: 500;
            border: none;
            border-radius: 0.4rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .edit-address-btn {
            background: #f3f4f6;
            color: #374151;

            &:hover {
              background: #e5e7eb;
            }
          }

          .delete-address-btn {
            background: #fef2f2;
            color: #dc2626;

            &:hover {
              background: #fee2e2;
            }
          }
        }
      }
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
