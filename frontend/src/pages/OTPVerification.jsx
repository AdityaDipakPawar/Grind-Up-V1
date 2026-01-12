import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import '../signup.css';
import '../styles/otpVerification.css';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Get email and userType from location state or navigate back if missing
  const email = location.state?.email;
  const userType = location.state?.userType;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setMessage('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) {
            newOtp[i] = digit;
          }
        });
        setOtp(newOtp);
        // Focus the last filled input or the last input
        const lastIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();
      });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setMessage('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp: otpString,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Update auth context
        updateUser(data.data.user);
        
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/profile', {
            state: {
              from: '/home',
              message: 'Please complete your profile to access full features'
            }
          });
        }, 1500);
      } else {
        setMessage(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth/resend-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage('OTP has been resent to your email');
        setResendCooldown(60); // 60 seconds cooldown
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setMessage(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (!email) {
    return null;
  }

  return (
    <div className="container">
      <main>
        <div>
          <h2>Verify Your Email</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
            We've sent a 6-digit verification code to<br />
            <strong>{email}</strong>
          </p>
          {message && (
            <div className={`message ${message.includes('success') || message.includes('resent') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleVerify}>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-input"
                  disabled={isLoading}
                />
              ))}
            </div>
            <button type="submit" disabled={isLoading || otp.join('').length !== 6}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
            <div className="resend-otp-container">
              <p>
                Didn't receive the code?{' '}
                {resendCooldown > 0 ? (
                  <span style={{ color: '#666' }}>
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="resend-link"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          </form>
        </div>
        <div className="login-link">
          <a href="/login">Back to Login</a>
        </div>
      </main>
    </div>
  );
};

export default OTPVerification;

