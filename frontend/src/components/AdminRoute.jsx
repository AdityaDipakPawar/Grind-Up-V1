import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.type !== 'admin')) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, user, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18 }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || user?.type !== 'admin') {
    return null;
  }

  return children;
};

export default AdminRoute;
