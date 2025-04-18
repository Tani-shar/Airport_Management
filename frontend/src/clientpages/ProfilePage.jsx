import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaPassport, FaGlobe, FaEdit, FaSave , FaCheckCircle} from 'react-icons/fa';
import './FlightBookingPage.css'; // Reuse your existing styles
import useAuthStore from '../store/useAuthStore';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const user_id = useAuthStore((state) => state.user_id);
//   console.log(userId);
  // Mock user data - replace with actual API call
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In real app: fetch('/api/profile')
        // setTimeout(() => {
        //   const mockUser = {
        //     id: 123,
        //     first_name: 'John',
        //     last_name: 'Doe',
        //     email: 'john.doe@example.com',
        //     phone: '+1234567890',
        //     age: 35,
        //     gender: 'Male',
        //     passport_number: 'AB1234567',
        //     nationality: 'United States',
        //     created_at: '2023-01-15T10:30:00Z'
        //   };
        //   setUser(mockUser);
        //   setFormData(mockUser);
        //   setLoading(false);
        // }, 800);
        console.log(user_id);
        const response = await fetch(`http://localhost:3001/api/profile?user_id=${user_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }

        });
        
        if(response.ok) {
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched user data:", data); // 👈 See what you're getting
                setUser(data.user);
                setFormData(data.user);
                setLoading(false);
            }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In real app: fetch('/api/profile', { method: 'PUT', body: JSON.stringify(formData) })
      setTimeout(() => {
        setUser(formData);
        setEditMode(false);
        setLoading(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-container">
        <div className="loading-spinner">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      {/* Header */}
      <header className="booking-header">
        <div className="booking-header-content">
          <h1 className="booking-title">My Profile</h1>
          <p className="booking-subtitle">Manage your personal information and preferences</p>
        </div>
      </header>

      <main className="booking-main">
        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <h2>
                <FaUser /> Personal Information
                
              </h2>
            </div>
            
            {editMode ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="age">Age</label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age || ''}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="passport_number">Passport Number</label>
                    <input
                      type="text"
                      id="passport_number"
                      name="passport_number"
                      value={formData.passport_number || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="nationality">Nationality</label>
                    <input
                      type="text"
                      id="nationality"
                      name="nationality"
                      value={formData.nationality || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setEditMode(false);
                      setFormData(user);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <h3>Name</h3>
                    <p>{user.first_name} {user.last_name}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3><FaEnvelope /> Email</h3>
                    <p>{user.email}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3><FaPhone /> Phone</h3>
                    <p>{user.phone || 'Not provided'}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3>Age</h3>
                    <p>{user.age || 'Not provided'}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3>Gender</h3>
                    <p>{user.gender || 'Not specified'}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3><FaPassport /> Passport</h3>
                    <p>{user.passport_number || 'Not provided'}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3><FaGlobe /> Nationality</h3>
                    <p>{user.nationality || 'Not provided'}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h3>Member Since</h3>
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Security Section */}
          <div className="security-card">
            <div className="security-header">
              <h2>Account Security</h2>
            </div>
            <div className="security-body">
              <button className="security-btn">Change Password</button>
              
            </div>
          </div>

          {/* Preferences Section */}
          
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <div>
              <h3>Profile Updated!</h3>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="booking-footer">
        <div className="footer-content">
          <div className="footer-layout">
            <div className="footer-brand">
              <h2>SkyWings Airlines</h2>
              <p>Travel with comfort and style</p>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} SkyWings Airlines. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;