import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts';
import './navbar.css';

const Navbar = () => {
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = (type) => {
    if (type === 'college') {
      navigate('/college-signup');
    } else if (type === 'company') {
      navigate('/company-signup');
    }
    setShowRegisterDropdown(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRegisterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="navbar-header">
      <div className="logo">
        <NavLink to="/home">
          <img src="/Logos/logo.png" alt="Logo" />
        </NavLink>
      </div>
      <nav className="navigation">
        <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        <NavLink to="/placements" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Placements</NavLink>
        <NavLink to="/invite" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Invites</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact us</NavLink>
      </nav>
      <div className="user-actions">
        {isAuthenticated ? (
          <div className="authenticated-user">
            <span className="welcome-text">Welcome, {user?.username || user?.collegeName || user?.companyName}</span>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Profile</NavLink>
            {user?.type === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={handleLoginClick}>
              Login
            </button>
            <div className="register-dropdown" ref={dropdownRef}>
              <button 
                className="register-btn" 
                onClick={() => setShowRegisterDropdown(!showRegisterDropdown)}
              >
                Register
              </button>
              {showRegisterDropdown && (
                <div className="dropdown-menu">
                  <button onClick={() => handleRegisterClick('college')}>
                    College Registration
                  </button>
                  <button onClick={() => handleRegisterClick('company')}>
                    Company Registration
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* <div className="notification-icon">
          <img src="/Logos/notification.svg" alt="Notifications" />
        </div>
        <div className="profile-icon">
          <img src="/Logos/profile.svg" alt="Profile" />
        </div> */}
      </div>
    </header>
  );
};

export default Navbar; 
