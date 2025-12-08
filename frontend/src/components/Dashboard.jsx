import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CollegeDashboard from './CollegeDashboard';
import CompanyDashboard from './CompanyDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.type === 'college') {
    return <CollegeDashboard />;
  } else if (user.type === 'company') {
    return <CompanyDashboard />;
  } else {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <h1>Invalid User Type</h1>
          <p>Your account type is not recognized.</p>
        </div>
      </div>
    );
  }
};

export default Dashboard;
