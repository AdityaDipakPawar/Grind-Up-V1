import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts';
import './signup.css';

const AdminSignup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', adminKey: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { registerAdmin, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.type === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.email) e.email = 'Email is required';
    if (!formData.password) e.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!formData.adminKey) e.adminKey = 'Admin key is required';
    return { isValid: Object.keys(e).length === 0, errors: e };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (!v.isValid) { setErrors(v.errors); return; }
    setIsLoading(true);
    setMessage('');
    try {
      const result = await registerAdmin({
        email: formData.email,
        password: formData.password,
        adminKey: formData.adminKey,
      });
      if (result.success) {
        setMessage(result.message);
        navigate('/admin');
      } else {
        setMessage(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <main>
        <div>
          <h2>Create Admin Account</h2>
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>
          )}
          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'error' : ''} required />
            {errors.email && <span className="error-text">{errors.email}</span>}

            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className={errors.password ? 'error' : ''} required />
            {errors.password && <span className="error-text">{errors.password}</span>}

            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} className={errors.confirmPassword ? 'error' : ''} required />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

            <input type="text" name="adminKey" placeholder="Admin Key" value={formData.adminKey} onChange={handleInputChange} className={errors.adminKey ? 'error' : ''} required />
            {errors.adminKey && <span className="error-text">{errors.adminKey}</span>}

            <button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Admin'}</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminSignup;
