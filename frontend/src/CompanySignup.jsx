import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts';
import { validateCompanySignupForm } from './utils';
import './signup.css';


const CompanySignup = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    password: '',
    confirmPassword: '',
    email: '',
    contactNo: '',
    industry: '',
    companySize: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const { registerCompany, isAuthenticated } = useAuth();

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
    const validation = validateCompanySignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await registerCompany(formData);
      if (result.success) {
        // Redirect to OTP verification page with normalized email from backend
        navigate('/verify-otp', {
          state: {
            email: result.email || formData.email,
            userType: result.userType || 'company'
          }
        });
      } else {
        let errorMessage = result.message || 'Registration failed. Please try again.';
        // In development, if OTP is included in response, redirect to OTP page with it
        if (result.otp && import.meta.env.MODE === 'development') {
          console.log('⚠️ DEVELOPMENT MODE: OTP received in response:', result.otp);
          // Still redirect to OTP page even if email failed, but pass the OTP
          navigate('/verify-otp', {
            state: {
              email: result.email || formData.email,
              userType: result.userType || 'company',
              devOTP: result.otp
            }
          });
          return;
        }
        setMessage(errorMessage);
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      let errorMessage = errorData.message || error.message || 'An unexpected error occurred. Please try again.';
      
      // Handle validation errors (from express-validator)
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        const validationMessages = errorData.errors.map(err => err.message || `${err.field}: ${err.message}`).join(', ');
        errorMessage = `Validation failed: ${validationMessages}`;
        // Also set field-specific errors
        const fieldErrors = {};
        errorData.errors.forEach(err => {
          if (err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }
      }
      
      // Handle network errors
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('exceeded')) {
        errorMessage = 'Request timed out. The server is taking too long to respond. Please try again.';
      }
      
      // Handle timeout status codes
      if (error.response?.status === 504) {
        errorMessage = errorData.message || 'Server timeout. Please try again.';
      }
      
      // In development, if OTP is included in response, redirect to OTP page with it
      if (errorData.data?.otp && import.meta.env.MODE === 'development') {
        console.log('⚠️ DEVELOPMENT MODE: OTP received in response:', errorData.data.otp);
        // Still redirect to OTP page even if email failed, but pass the OTP
        navigate('/verify-otp', {
          state: {
            email: errorData.data?.email || formData.email,
            userType: errorData.data?.userType || 'company',
            devOTP: errorData.data.otp
          }
        });
        return;
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
          <img src="/Logos/logo.png" alt="Logo" />
        </div>
        <div className="login-link">
          <a href="/login">Already Registered? Login here</a>
        </div>
      </header> */}
      <main>
        <div>
          <h2>Register your company for placements</h2>
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="companyName"
              placeholder="Company Name" 
              value={formData.companyName}
              onChange={handleInputChange}
              className={errors.companyName ? 'error' : ''}
              required 
            />
            {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            
            
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
            
            <input 
              type="text" 
              name="industry"
              placeholder="Industry" 
              value={formData.industry}
              onChange={handleInputChange}
              className={errors.industry ? 'error' : ''}
              required 
            />
            {errors.industry && <span className="error-text">{errors.industry}</span>}
            
            <label htmlFor="companySize" style={{ display: 'block', marginTop: '8px' }}>Company Size</label>
            <select
              name="companySize"
              id="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
              className={errors.companySize ? 'error' : ''}
              required
              style={{ padding: '8px', width: '100%', marginBottom: '6px' }}
            >
              <option value="">Select company size</option>
              <option value="1-50">1-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="501-1000">501-1000</option>
              <option value="1000+">1000+</option>
            </select>
            {errors.companySize && <span className="error-text">{errors.companySize}</span>}
            
            <input 
              type="text" 
              name="location"
              placeholder="Location" 
              value={formData.location}
              onChange={handleInputChange}
              className={errors.location ? 'error' : ''}
              required 
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
            
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

export default CompanySignup;

