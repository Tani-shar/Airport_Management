// src/component/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Optional: Customize your styles here
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // ✅ consistent casing
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SkyLink
        </Link>

        {isAuthenticated && (
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-links">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/manage-booking" className="nav-links">Manage Booking</Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/flight-status" className="nav-links">Flight Status</Link>
            </li> */}
            <li className="nav-item">
              <Link to="/check-in" className="nav-links">Online Check-in</Link>
            </li>
            {/* <li className="nav-item">
              <Link to="/my-trips" className="nav-links">My Trips</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-links">Contact</Link>
            </li> */}
          </ul>
        )}

        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-links">My Profile</Link>
              <button className="nav-links logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-links">Login</Link>
              <Link to="/signup" className="nav-links">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
