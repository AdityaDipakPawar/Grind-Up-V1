import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireCompleteProfile = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (requireCompleteProfile && !loading && user && !user.profileComplete) {
      navigate('/profile', { 
        state: { from: location.pathname, message: 'Please complete your profile first' } 
      });
    }
  }, [user, requireCompleteProfile, loading, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireCompleteProfile && !user?.profileComplete) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
