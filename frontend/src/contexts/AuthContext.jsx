import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Try to get user data, but don't block the app if backend is not available
          try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData.user);
            setIsAuthenticated(true);
          } catch (apiError) {
            console.warn('Backend not available, using cached user data');
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              setIsAuthenticated(true);
            } else {
              localStorage.removeItem('authToken');
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      const message = errorData.message || 'Login failed. Please try again.';
      return { 
        success: false, 
        message,
        requiresVerification: errorData.requiresVerification,
        email: errorData.email,
        userType: errorData.userType,
        status: error.response?.status
      };
    } finally {
      setLoading(false);
    }
  };

  // College registration function
  const registerCollege = async (collegeData) => {
    try {
      setLoading(true);
      const response = await authAPI.registerCollege(collegeData);
      
      if (response.success) {
        // Registration successful but email not verified yet
        // Return success so user can be redirected to OTP page
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Company registration function
  const registerCompany = async (companyData) => {
    try {
      setLoading(true);
      const response = await authAPI.registerCompany(companyData);
      
      if (response.success) {
        // Registration successful but email not verified yet
        // Return success so user can be redirected to OTP page
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      // If validation errors from express-validator exist, concatenate them
      const apiData = error.response?.data;
      if (apiData && Array.isArray(apiData.errors)) {
        const msgs = apiData.errors.map(e => `${e.field}: ${e.message}`);
        return { success: false, message: msgs.join(' | ') };
      }
      const message = apiData?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Admin registration function
  const registerAdmin = async (adminData) => {
    try {
      setLoading(true);
      const response = await authAPI.registerAdmin(adminData);
      if (response.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Admin registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData) {
      setIsAuthenticated(true);
    }
  };

  // Check profile completion status
  const checkProfileCompletion = async () => {
    try {
      const response = await authAPI.checkProfileCompletion();
      if (response.success) {
        return {
          profileComplete: response.profileComplete,
          missingFields: response.missingFields
        };
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    }
    return { profileComplete: user?.profileComplete || false, missingFields: [] };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    registerCollege,
    registerCompany,
    registerAdmin,
    logout,
    updateUser,
    checkProfileCompletion,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

