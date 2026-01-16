import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts';
import { validateLoginForm } from './utils';
import './login.css';

const Login = () => {
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { login, isAuthenticated } = useAuth();

  const handleRegisterClick = (type) => {
    if (type === 'college') {
      navigate('/college-signup');
    } else if (type === 'company') {
      navigate('/company-signup');
    }
    setShowRegisterDropdown(false);
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await login(formData);
      if (result.success) {
        setMessage(result.message);
        // Redirect to profile page if profile is incomplete, otherwise to home
        navigate('/home');
      } else {
        // Check if the error is about email verification (403 status)
        if (result.status === 403 && (result.message.includes('verify your email') || result.requiresVerification)) {
          // Redirect to OTP verification page with email and userType from response
          navigate('/verify-otp', {
            state: {
              email: result.email || formData.email,
              userType: result.userType || 'college'
            }
          });
          return; // Don't set error message since we're redirecting
        }
        setMessage(result.message);
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      let errorMessage = errorData.message || error.message || 'An unexpected error occurred. Please try again.';
      
      // Handle network errors
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      // Check if the error is about email verification (403 status)
      if (error.response?.status === 403 && (errorMessage.includes('verify your email') || errorData.requiresVerification)) {
        // Redirect to OTP verification page with email and userType from response
        navigate('/verify-otp', {
          state: {
            email: errorData.email || formData.email,
            userType: errorData.userType || 'college'
          }
        });
        return; // Don't set error message since we're redirecting
      }
      
      // Always display error message on screen
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {/* <header>
        <div className="logo">
          <a href="/home"><img src="/Logos/logo.png" alt="Logo" /></a>
        </div>
        
      </header> */}
    <main>
      <div className="login-form">
        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            required 
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
          
          <input 
            type="password" 
            name="password"
            placeholder="Password" 
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            required 
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
          {/* <a href="#" className="forgot-password">Forgot password?</a> */}
        </form>
        <div className="new-here-section">
          <span className="new-here-text">New here?</span>
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
      </div>
      {/* <div className="social-login">
        <p>Log in with</p>
        <div className="social-icons">
          <img src="/Logos/LinkedIn Circled.svg" alt="LinkedIn" />
          <img src="/Logos/Google Circled.svg" alt="Google" />
          <img src="/Logos/twitter.svg" alt="Twitter" />
        </div>
      </div> */}
      
    </main>
    {/* <footer>
      <div className="footer-left">
        <div className="logo">
          <img src="/Logos/logo.png" alt="Logo" />
        </div>
        <div className="footer-section">
          <p>Know more about us :</p>
          <div className="social-links">
            <a href="#"><img src="/Logos/instagram-stroke-rounded.svg" alt="Instagram" /></a>
            <a href="#"><img src="/Logos/email.svg" alt="Gmail" /></a>
            <a href="#"><img src="/Logos/LinkedIn.svg" alt="LinkedIn" /></a>
          </div>
        </div>
      </div>
      <div className="footer-center">
        <a href="#">Contact us</a>
        <a href="#">Terms & Conditions</a>
        <a href="#">Privacy Policy</a>
        <a href="#">About us</a>
      </div>
      <div className="footer-right">
        <p>Download our app</p>
        <div className="app-buttons">
          <img src="/Logos/google-play.png" alt="Google Play" />
          <img src="/Logos/app-store.png" alt="App Store" />
        </div>
      </div>
    </footer> */}
  </div>
  );
};

export default Login; 