import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts';
import { validateCollegeSignupForm } from './utils';
import './signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    collegeName: '',
    email: '',
    contactNo: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const { registerCollege, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

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
    const validation = validateCollegeSignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await registerCollege(formData);
      if (result.success) {
        setMessage(result.message);
        // Redirect to profile page for completion
        navigate('/profile', { state: { from: '/home', message: 'Please complete your profile to access full features' } });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {/* <header>
        <div className="logo">
          <img src="/Logos/logo.png" alt="Logo" />
        </div>
        <div className="login-link">
          <a href="/login">Already Registered? Login here</a>
        </div>
      </header> */}
      <main>
        <div>
          <h2>Enroll your college for placements</h2>
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            
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
            
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? 'error' : ''}
              required 
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            
            <input 
              type="text" 
              name="collegeName"
              placeholder="College name" 
              value={formData.collegeName}
              onChange={handleInputChange}
              className={errors.collegeName ? 'error' : ''}
              required 
            />
            {errors.collegeName && <span className="error-text">{errors.collegeName}</span>}
            
            <input 
              type="email" 
              name="email"
              placeholder="Official email" 
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              required 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
            
            <input 
              type="tel" 
              name="contactNo"
              placeholder="Contact no." 
              value={formData.contactNo}
              onChange={handleInputChange}
              className={errors.contactNo ? 'error' : ''}
              required 
            />
            {errors.contactNo && <span className="error-text">{errors.contactNo}</span>}
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>
        <div className="login-link">
          <a href="/login">Already Registered? Login here</a>
        </div>
      {/* <div className="social-login">
        <p>Continue with</p>
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
        <a href="#">FAQ</a>
      </div>
      <div className="footer-right">
        <p>Download our app</p>
        <img src="/Logos/google-play.png" alt="Google Play" />
        <img src="/Logos/app-store.png" alt="App Store" />
      </div>
    </footer> */}
  </div>
  );
};

export default Signup; 